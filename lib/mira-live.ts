"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loginPath } from "@/lib/auth-redirect";
import { ApiError, apiError } from "@/lib/data/wire";

/**
 * Live voice with Mira. The browser gets a one-minute ticket over the same-origin proxy (cookie
 * auth), then opens a WebSocket straight to the API, which bridges to Gemini Live on Vertex AI.
 * Up: 16 kHz 16-bit mono PCM from the mic, plus JSON text turns. Down: Mira's 24 kHz PCM plus
 * JSON captions and turn events.
 */

const INPUT_RATE = 16_000;
const OUTPUT_RATE = 24_000;
/** ~40 ms of mic audio per frame. */
const FRAME_SAMPLES = 640;

export type LiveCaption = {
  id: string;
  role: "mira" | "learner";
  via: "voice" | "text";
  text: string;
  final: boolean;
  interrupted?: boolean;
};

export type LiveStatus = "off" | "connecting" | "live";
export type MicState = "off" | "on" | "muted";

type ServerMessage =
  | { type: "ready" | "interrupted" | "turn_complete" }
  | { type: "error"; code: string; message: string }
  | { type: "transcript"; id: string; role: "mira" | "learner"; text: string; final: boolean; interrupted?: boolean };

const MESSAGES: Record<string, string> = {
  voice_unavailable: "Mira's voice isn't set up on this server yet. Try again later.",
  session_ended: "This session has ended. Start a new one to keep talking.",
  mic_blocked: "Your microphone is blocked. Allow it in the browser's site settings, or type instead.",
  mic_missing: "No microphone found. Plug one in, or type instead.",
  network: "Couldn't reach Mira. Check your connection and try again.",
};

function wsBase() {
  const configured = process.env.NEXT_PUBLIC_API_WS_URL;
  if (configured) return configured.replace(/\/+$/, "");
  const { protocol, host } = window.location;
  return `${protocol === "https:" ? "wss" : "ws"}://${host}`;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { accept: "application/json", ...(body !== undefined && { "content-type": "application/json" }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) {
    window.location.assign(loginPath(window.location.pathname + window.location.search));
    return new Promise<T>(() => {});
  }
  if (!res.ok) throw await apiError(res, path);
  return (await res.json()) as T;
}

/** Starts (or resumes) the session to talk in: a block's session, or a fresh open one. */
export async function startLiveSession(blockSlug?: string): Promise<string> {
  const session = await post<{ id: string }>("/sessions", blockSlug ? { blockSlug } : {});
  return session.id;
}

// Mic → 16 kHz PCM16 frames. Runs on the audio thread; resamples from the device rate.
const CAPTURE_WORKLET = `
class Capture extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.ratio = sampleRate / ${INPUT_RATE};
    this.pos = 0;
    this.frame = new Int16Array(${FRAME_SAMPLES});
    this.n = 0;
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    while (this.pos < ch.length) {
      const i = Math.floor(this.pos), f = this.pos - i;
      const a = ch[i], b = i + 1 < ch.length ? ch[i + 1] : a;
      const s = Math.max(-1, Math.min(1, a + (b - a) * f));
      this.frame[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.n === this.frame.length) {
        this.port.postMessage(this.frame.buffer, [this.frame.buffer]);
        this.frame = new Int16Array(${FRAME_SAMPLES});
        this.n = 0;
      }
      this.pos += this.ratio;
    }
    this.pos -= ch.length;
    return true;
  }
}
registerProcessor("mira-capture", Capture);
`;

class Mic {
  private constructor(
    private ctx: AudioContext,
    private stream: MediaStream,
    private node: AudioWorkletNode,
  ) {}

  static async open(onFrame: (pcm: ArrayBuffer) => void): Promise<Mic> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    const ctx = new AudioContext();
    try {
      const url = URL.createObjectURL(new Blob([CAPTURE_WORKLET], { type: "text/javascript" }));
      try {
        await ctx.audioWorklet.addModule(url);
      } finally {
        URL.revokeObjectURL(url);
      }
      const node = new AudioWorkletNode(ctx, "mira-capture");
      node.port.onmessage = (e: MessageEvent<ArrayBuffer>) => onFrame(e.data);
      ctx.createMediaStreamSource(stream).connect(node);
      return new Mic(ctx, stream, node);
    } catch (error) {
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close();
      throw error;
    }
  }

  close() {
    this.node.port.onmessage = null;
    this.node.disconnect();
    this.stream.getTracks().forEach((t) => t.stop());
    void this.ctx.close();
  }
}

/** Gapless playback of Mira's 24 kHz PCM; `flush` cuts her off when the learner interrupts. */
class Speaker {
  private ctx = new AudioContext({ sampleRate: OUTPUT_RATE });
  private sources = new Set<AudioBufferSourceNode>();
  private until = 0;

  constructor(private onSpeaking: (speaking: boolean) => void) {}

  resume() {
    return this.ctx.resume();
  }

  play(data: ArrayBuffer) {
    const pcm = new Int16Array(data);
    if (!pcm.length) return;
    const buffer = this.ctx.createBuffer(1, pcm.length, OUTPUT_RATE);
    const ch = buffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 0x8000;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    this.until = Math.max(this.until, this.ctx.currentTime + 0.05);
    source.start(this.until);
    this.until += buffer.duration;
    this.sources.add(source);
    this.onSpeaking(true);
    source.onended = () => {
      this.sources.delete(source);
      if (!this.sources.size) this.onSpeaking(false);
    };
  }

  flush() {
    for (const s of this.sources) {
      s.onended = null;
      s.stop();
    }
    this.sources.clear();
    this.until = 0;
    this.onSpeaking(false);
  }

  close() {
    this.flush();
    void this.ctx.close();
  }
}

export function useMiraLive({
  getSessionId,
  onClose,
}: {
  /** Resolves the session to talk in, starting one if needed. */
  getSessionId: () => Promise<string>;
  /** After the socket closes, e.g. to refetch the saved transcript. */
  onClose?: (sessionId: string) => void;
}) {
  const [status, setStatus] = useState<LiveStatus>("off");
  const [mic, setMicState] = useState<MicState>("off");
  const [speaking, setSpeaking] = useState(false);
  const [captions, setCaptions] = useState<LiveCaption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const connecting = useRef<Promise<WebSocket> | null>(null);
  const speaker = useRef<Speaker | null>(null);
  const micRef = useRef<Mic | null>(null);
  const muted = useRef(false);
  const sessionId = useRef<string | null>(null);
  const turn = useRef(0);
  const generation = useRef(0);
  const callbacks = useRef({ getSessionId, onClose });
  useEffect(() => {
    callbacks.current = { getSessionId, onClose };
  });

  const upsert = useCallback((c: LiveCaption) => {
    setCaptions((all) => {
      const i = all.findIndex((x) => x.id === c.id);
      if (i === -1) return [...all, c];
      const next = all.slice();
      next[i] = c;
      return next;
    });
  }, []);

  const stopMic = useCallback(() => {
    micRef.current?.close();
    micRef.current = null;
    muted.current = false;
    setMicState("off");
  }, []);

  const teardown = useCallback(() => {
    generation.current++;
    stopMic();
    speaker.current?.close();
    speaker.current = null;
    const socket = ws.current;
    ws.current = null;
    connecting.current = null;
    if (socket?.readyState === WebSocket.OPEN) {
      // The server saves the last turns, then closes; onclose refetches.
      socket.send(JSON.stringify({ type: "end" }));
      setTimeout(() => socket.close(1000), 5000);
    } else if (socket?.readyState === WebSocket.CONNECTING) socket.close(1000);
    setSpeaking(false);
    setStatus("off");
  }, [stopMic]);

  const connect = useCallback((): Promise<WebSocket> => {
    if (ws.current?.readyState === WebSocket.OPEN) return Promise.resolve(ws.current);
    if (connecting.current) return connecting.current;
    setError(null);
    setStatus("connecting");
    // Created inside the user's tap so browsers allow playback.
    speaker.current ??= new Speaker(setSpeaking);
    void speaker.current.resume();
    const attempt = (async () => {
      const id = (sessionId.current ??= await callbacks.current.getSessionId());
      const { ticket } = await post<{ ticket: string }>(`/sessions/${id}/live-ticket`);
      // Captions from an earlier connection keep their place; new ids must not collide.
      const prefix = `c${++turn.current}-`;
      const socket = new WebSocket(`${wsBase()}/api/v1/sessions/${id}/live?ticket=${encodeURIComponent(ticket)}`);
      socket.binaryType = "arraybuffer";
      return await new Promise<WebSocket>((resolve, reject) => {
        let ready = false;
        socket.onmessage = (e: MessageEvent<ArrayBuffer | string>) => {
          if (typeof e.data !== "string") {
            speaker.current?.play(e.data);
            return;
          }
          const m = JSON.parse(e.data) as ServerMessage;
          if (m.type === "ready") {
            ready = true;
            ws.current = socket;
            setStatus("live");
            resolve(socket);
          } else if (m.type === "transcript") {
            upsert({ id: prefix + m.id, role: m.role, via: "voice", text: m.text, final: m.final, interrupted: m.interrupted });
          } else if (m.type === "interrupted") {
            speaker.current?.flush();
          } else if (m.type === "error") {
            setError(MESSAGES[m.code] ?? m.message);
          }
        };
        socket.onclose = () => {
          if (!ready) reject(new ApiError(0, "network", MESSAGES.network));
          else callbacks.current.onClose?.(id);
          if (ws.current === socket) teardown();
        };
      });
    })();
    connecting.current = attempt;
    attempt.catch((e: unknown) => {
      teardown();
      setError(e instanceof ApiError ? (MESSAGES[e.code] ?? e.message) : MESSAGES.network);
    });
    return attempt;
  }, [teardown, upsert]);

  const startTalking = useCallback(async () => {
    if (micRef.current) return;
    setMicState("on");
    const current = generation.current;
    const [socket, opened] = await Promise.allSettled([
      connect(),
      Mic.open((pcm) => {
        const s = ws.current;
        if (!muted.current && s?.readyState === WebSocket.OPEN) s.send(pcm);
      }),
    ]);
    const device = opened.status === "fulfilled" ? opened.value : null;
    // Failed to connect (already torn down), or stopped while the mic was starting up.
    if (socket.status === "rejected" || current !== generation.current) return device?.close();
    if (!device) {
      stopMic();
      const reason: unknown = opened.status === "rejected" ? opened.reason : null;
      setError(reason instanceof DOMException && reason.name === "NotFoundError" ? MESSAGES.mic_missing : MESSAGES.mic_blocked);
      return;
    }
    micRef.current = device;
    muted.current = false;
  }, [connect, stopMic]);

  const setMuted = useCallback((value: boolean) => {
    if (!micRef.current) return;
    muted.current = value;
    setMicState(value ? "muted" : "on");
    // Tells Gemini the learner stopped, so a half-finished thought still gets an answer.
    if (value && ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: "audio_end" }));
  }, []);

  const sendText = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t) return;
      const clientId = crypto.randomUUID();
      upsert({ id: clientId, role: "learner", via: "text", text: t, final: true });
      try {
        const socket = await connect();
        socket.send(JSON.stringify({ type: "text", text: t, clientId }));
      } catch {
        setCaptions((all) => all.filter((c) => c.id !== clientId));
      }
    },
    [connect, upsert],
  );

  useEffect(() => teardown, [teardown]);

  return {
    status,
    mic,
    speaking,
    captions,
    error,
    dismissError: () => setError(null),
    startTalking,
    stopTalking: stopMic,
    stop: teardown,
    setMuted,
    sendText,
  };
}

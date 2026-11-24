/**
 * Seeds the database from the UI mock fixtures so the FastAPI backend serves the same demo world.
 *
 *   npm run db:seed                          # catalog only, plus demo data for the only user if there is one
 *   npm run db:seed -- --email you@x.com     # demo data for that user
 *   npm run db:seed -- --email you@x.com --reset   # wipe that user's learning data first
 *
 * Catalog rows (topics, blocks, concepts, edges) are upserted by slug, so reruns are safe.
 * Learner data is only written for a user who has none, unless --reset is passed.
 */
import { parseArgs } from "node:util";

import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  blocks,
  conceptLinks,
  concepts,
  memory,
  recallQueue,
  savedBlockIds,
  sessions,
  settings,
} from "../lib/data/mock/fixtures";
import type { LearningBlock } from "../lib/data/types";
import {
  PrismaClient,
  type ConceptState,
  type Prisma,
} from "../lib/generated/prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const now = Date.now();
const ago = (ms: number) => new Date(now - ms);

const TOPICS = [
  "Space",
  "Biology",
  "History",
  "Physics",
  "Psychology",
] as const;
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Concepts the UI references only by session, so the fixtures have no graph node for them. */
const EXTRA_CONCEPTS = [
  {
    id: "chromatophores",
    label: "Chromatophores",
    topic: "Biology",
    summary:
      "Pigment sacs in the skin that octopuses expand and squeeze to change colour in a blink.",
  },
];

/** When each mock session last happened; mirrors the fixture's `whenLabel`. */
const SESSION_AGE: Record<string, number> = {
  "octopus-arms": 2 * HOUR,
  aurora: 1 * DAY,
  bubble: 2.5 * DAY,
  parthenon: 4 * DAY,
  fungi: 5 * DAY,
  placebo: 14 * DAY,
};

/** Cards already in review, behind the fixture's review history. */
const REVIEWED_CARDS = [
  {
    concept: "solar-wind",
    session: "aurora",
    question: "What is the solar wind made of?",
    options: [
      { id: "a", label: "Charged particles streaming from the Sun" },
      { id: "b", label: "Sunlight reflected off dust" },
      { id: "c", label: "Air pushed by Earth's rotation" },
    ],
    correctId: "a",
    explanation:
      "The solar wind is a stream of charged particles, mostly protons and electrons, flowing out from the Sun.",
    outcome: "recalled" as const,
    reviewedAgo: 1 * DAY,
    nextIn: 6 * DAY,
  },
  {
    concept: "placebo",
    session: "placebo",
    question: "In open-label placebo trials, what did participants know?",
    options: [
      { id: "a", label: "Nothing about the pills" },
      { id: "b", label: "That their pills were inert" },
      { id: "c", label: "That they had the real drug" },
    ],
    correctId: "b",
    explanation:
      "Participants were told plainly that the pills had no active ingredient, and some still felt better.",
    outcome: "recalled" as const,
    reviewedAgo: 3 * DAY,
    nextIn: 9 * DAY,
  },
  {
    concept: "mycorrhiza",
    session: "fungi",
    question: "What do mycorrhizal fungi get from the plants they connect to?",
    options: [
      { id: "a", label: "Water" },
      { id: "b", label: "Sugars" },
      { id: "c", label: "Nitrogen" },
    ],
    correctId: "b",
    explanation:
      "Fungi trade water and minerals for the sugars plants make through photosynthesis.",
    outcome: "missed" as const,
    reviewedAgo: 4 * DAY,
    nextIn: 1 * DAY,
  },
  {
    concept: "magnetosphere",
    session: "aurora",
    question: "Why do auroras mostly appear near the poles?",
    options: [
      { id: "a", label: "The poles are colder" },
      { id: "b", label: "Earth's magnetic field funnels particles there" },
      { id: "c", label: "The atmosphere is thickest there" },
    ],
    correctId: "b",
    explanation:
      "Field lines dip into the atmosphere near the poles, guiding solar particles into auroral ovals.",
    outcome: "recalled" as const,
    reviewedAgo: 4 * DAY,
    nextIn: 4 * DAY,
  },
];

const SAVED_AGE: Record<string, number> = {
  "tardigrade-survival": 1 * HOUR,
  "deja-vu": 1 * DAY,
  "bubble-nebula": 2.5 * DAY,
  "honest-placebo": 14 * DAY,
};

type Db = Prisma.TransactionClient;

const STATE_RANK: Record<ConceptState, number> = {
  discussed: 0,
  practiced: 1,
  demonstrated: 2,
};

function activitySpec(
  activity: NonNullable<LearningBlock["activity"]>,
): Prisma.InputJsonValue {
  // `spec` holds everything except id/kind/title/prompt, matching backend/app/schemas/activities.py.
  const spec: Record<string, unknown> = { ...activity };
  for (const key of ["kind", "title", "prompt"]) delete spec[key];
  return spec as Prisma.InputJsonValue;
}

async function seedCatalog() {
  const topicIds = new Map<string, string>();
  for (const [position, name] of TOPICS.entries()) {
    const slug = slugify(name);
    const topic = await prisma.topic.upsert({
      where: { slug },
      create: { slug, name, position },
      update: { name, position },
    });
    topicIds.set(name, topic.id);
  }

  const blockIds = new Map<string, string>();
  for (const [index, block] of blocks.entries()) {
    const data = {
      topicId: topicIds.get(block.topic)!,
      question: block.question,
      teaser: block.teaser,
      body: block.body,
      minutes: block.minutes,
      imageSrc: block.image.src,
      imageAlt: block.image.alt,
      status: "published" as const,
      // The feed is newest first, so fixture order becomes publish order.
      publishedAt: ago((index + 1) * 6 * HOUR),
    };
    const row = await prisma.learningBlock.upsert({
      where: { slug: block.id },
      create: { slug: block.id, ...data },
      update: data,
    });
    blockIds.set(block.id, row.id);

    await prisma.blockSource.deleteMany({ where: { blockId: row.id } });
    await prisma.blockSource.createMany({
      data: block.sources.map((s, position) => ({
        blockId: row.id,
        position,
        ...s,
      })),
    });

    const existing = await prisma.activity.findFirst({
      where: { blockId: row.id, sessionId: null },
    });
    if (block.activity) {
      const activity = {
        kind: block.activity.kind,
        origin: "authored" as const,
        title: block.activity.title,
        prompt: block.activity.prompt,
        spec: activitySpec(block.activity),
      };
      if (existing)
        await prisma.activity.update({
          where: { id: existing.id },
          data: activity,
        });
      else
        await prisma.activity.create({
          data: { ...activity, blockId: row.id },
        });
    }
  }

  const conceptIds = new Map<string, string>();
  for (const c of [...concepts, ...EXTRA_CONCEPTS]) {
    const data = {
      label: c.label,
      summary: c.summary,
      topicId: topicIds.get(c.topic)!,
    };
    const row = await prisma.concept.upsert({
      where: { slug: c.id },
      create: { slug: c.id, ...data },
      update: data,
    });
    conceptIds.set(c.id, row.id);
  }

  // A block teaches the concepts its session covered, in the order the session listed them.
  for (const session of sessions) {
    const blockId = session.blockId && blockIds.get(session.blockId);
    if (!blockId) continue;
    await prisma.blockConcept.deleteMany({ where: { blockId } });
    await prisma.blockConcept.createMany({
      data: session.concepts.map((c, position) => ({
        blockId,
        conceptId: conceptIds.get(c.conceptId)!,
        position,
      })),
    });
  }

  // Session links are derived from sessions at read time; only semantic edges are stored.
  for (const link of conceptLinks.filter((l) => l.kind === "semantic")) {
    // A CHECK constraint keeps semantic edges undirected: from_id < to_id.
    const [fromId, toId] = [
      conceptIds.get(link.from)!,
      conceptIds.get(link.to)!,
    ].sort();
    const data = {
      similarity: link.similarity ?? null,
      rationale: link.rationale,
      model: "seed",
    };
    await prisma.conceptEdge.upsert({
      where: { fromId_toId_kind: { fromId, toId, kind: "semantic" } },
      create: { fromId, toId, kind: "semantic", ...data },
      update: data,
    });
  }

  return { topicIds, blockIds, conceptIds };
}

async function resetLearner(db: Db, userId: string) {
  // Sessions cascade to messages, recaps, attempts, session concepts, session evidence and session activities.
  await db.learningSession.deleteMany({ where: { userId } });
  await db.recallItem.deleteMany({ where: { userId } });
  await db.conceptEvidence.deleteMany({ where: { userId } });
  await db.userConcept.deleteMany({ where: { userId } });
  await db.learnerMemory.deleteMany({ where: { userId } });
  await db.savedBlock.deleteMany({ where: { userId } });
  await db.blockEvent.deleteMany({ where: { userId } });
  await db.userInterest.deleteMany({ where: { userId } });
  await db.learnerSettings.deleteMany({ where: { userId } });
}

async function seedLearner(
  db: Db,
  userId: string,
  catalog: Awaited<ReturnType<typeof seedCatalog>>,
) {
  const { topicIds, blockIds, conceptIds } = catalog;
  const sessionIds = new Map<string, string>();
  const userConcepts = new Map<
    string,
    { state: ConceptState; first: Date; last: Date }
  >();

  for (const s of sessions) {
    const lastActivityAt = ago(SESSION_AGE[s.id]);
    const startedAt = new Date(lastActivityAt.getTime() - s.minutes * 60_000);
    const blockId = s.blockId ? blockIds.get(s.blockId) : undefined;

    const session = await db.learningSession.create({
      data: {
        userId,
        blockId,
        title: s.title,
        status: s.status,
        startedAt,
        lastActivityAt,
        endedAt: s.status === "finished" ? lastActivityAt : null,
        activeSeconds: s.minutes * 60,
        messageCount: s.transcript.length,
      },
    });
    sessionIds.set(s.id, session.id);

    const step = (s.minutes * 60_000) / Math.max(s.transcript.length, 1);
    const messageIds: string[] = [];
    for (const [i, m] of s.transcript.entries()) {
      const message = await db.sessionMessage.create({
        data: {
          sessionId: session.id,
          seq: i + 1,
          role: m.role,
          via: m.via,
          text: m.text,
          clientId: `seed-${m.id}`,
          createdAt: new Date(startedAt.getTime() + i * step),
        },
      });
      messageIds.push(message.id);
    }

    const activity = blockId
      ? await db.activity.findFirst({ where: { blockId, sessionId: null } })
      : null;
    const attemptIds: string[] = [];
    if (activity) {
      for (const [i, a] of s.attempts.entries()) {
        const attempt = await db.activityAttempt.create({
          data: {
            userId,
            activityId: activity.id,
            sessionId: session.id,
            outcome: a.outcome,
            response: {},
            correct: a.outcome === "solved",
            note: a.note,
            clientId: `seed-${s.id}-attempt-${i}`,
            createdAt: lastActivityAt,
          },
        });
        attemptIds.push(attempt.id);
      }
    }

    if (s.recapStatus !== "none") {
      const recap = s.recap;
      await db.recap.create({
        data: {
          sessionId: session.id,
          version: recap?.version ?? 1,
          status: s.recapStatus,
          summary: recap?.summary,
          keyIdeas: recap?.keyIdeas,
          openQuestions: recap?.openQuestions ?? [],
          nextSteps: recap?.nextSteps ?? [],
          model: recap ? "seed" : null,
          error:
            s.recapStatus === "failed"
              ? "Seeded failure: the recap model timed out."
              : null,
          createdAt: lastActivityAt,
          completedAt: s.recapStatus === "generating" ? null : lastActivityAt,
        },
      });
    }

    for (const c of s.concepts) {
      if (c.state === "next") continue; // Untouched block concepts are derived as "next" at read time.
      const conceptId = conceptIds.get(c.conceptId)!;
      await db.sessionConcept.create({
        data: {
          sessionId: session.id,
          conceptId,
          state: c.state,
          createdAt: lastActivityAt,
        },
      });

      // Practice and demonstration point at the attempt when there is one; talk points at the last message.
      const fromActivity = c.state !== "discussed" && attemptIds.length > 0;
      await db.conceptEvidence.create({
        data: {
          userId,
          conceptId,
          sessionId: session.id,
          kind: c.state,
          source: fromActivity ? "activity" : "message",
          sourceId: fromActivity ? attemptIds.at(-1)! : messageIds.at(-1)!,
          createdAt: lastActivityAt,
        },
      });

      const known = userConcepts.get(conceptId);
      userConcepts.set(conceptId, {
        state:
          known && STATE_RANK[known.state] > STATE_RANK[c.state]
            ? known.state
            : c.state,
        first: known && known.first < startedAt ? known.first : startedAt,
        last:
          known && known.last > lastActivityAt ? known.last : lastActivityAt,
      });
    }
  }

  await db.userConcept.createMany({
    data: [...userConcepts].map(([conceptId, u]) => ({
      userId,
      conceptId,
      state: u.state,
      firstSeenAt: u.first,
      lastEvidenceAt: u.last,
    })),
  });

  // Fresh cards, due now.
  for (const r of recallQueue) {
    await db.recallItem.create({
      data: {
        userId,
        conceptId: conceptIds.get(r.conceptId)!,
        sessionId: sessionIds.get(r.sessionId),
        question: r.question,
        options: r.options,
        correctOptionId: r.correctId,
        explanation: r.explanation,
        model: "seed",
        dueAt: ago(HOUR),
      },
    });
  }

  // Cards with one review behind them, which become the review history.
  for (const [i, card] of REVIEWED_CARDS.entries()) {
    const reviewedAt = ago(card.reviewedAgo);
    const nextDueAt = new Date(reviewedAt.getTime() + card.nextIn);
    const recalled = card.outcome === "recalled";
    const item = await db.recallItem.create({
      data: {
        userId,
        conceptId: conceptIds.get(card.concept)!,
        sessionId: sessionIds.get(card.session),
        question: card.question,
        options: card.options,
        correctOptionId: card.correctId,
        explanation: card.explanation,
        model: "seed",
        state: recalled ? "review" : "learning",
        dueAt: nextDueAt,
        stability: card.nextIn / DAY,
        difficulty: recalled ? 5 : 7,
        reps: 1,
        lastReviewedAt: reviewedAt,
        createdAt: new Date(reviewedAt.getTime() - DAY),
      },
    });
    await db.recallReview.create({
      data: {
        itemId: item.id,
        userId,
        outcome: card.outcome,
        chosenOptionId: recalled
          ? card.correctId
          : card.options.find((o) => o.id !== card.correctId)!.id,
        responseMs: 4_000 + i * 1_500,
        previousDueAt: reviewedAt,
        nextDueAt,
        clientId: `seed-review-${card.concept}`,
        reviewedAt,
      },
    });
  }

  const memoryLinks: Record<string, { session?: string; concept?: string }> = {
    mem2: { session: "octopus-arms", concept: "distributed" },
    mem3: { session: "aurora", concept: "auroral-emission" },
  };
  for (const m of memory) {
    const link = memoryLinks[m.id] ?? {};
    await db.learnerMemory.create({
      data: {
        userId,
        kind: m.kind,
        text: m.text,
        evidence: m.evidence,
        sessionId: link.session ? sessionIds.get(link.session) : undefined,
        conceptId: link.concept ? conceptIds.get(link.concept) : undefined,
      },
    });
  }

  await db.savedBlock.createMany({
    data: savedBlockIds.map((s) => ({
      userId,
      blockId: blockIds.get(s.blockId)!,
      createdAt: ago(SAVED_AGE[s.blockId] ?? DAY),
    })),
    skipDuplicates: true,
  });

  // Settings and interests may already exist from using the app; the demo values replace them.
  const learnerSettings = {
    voiceId: settings.voice.voiceId,
    voicePace: settings.voice.pace,
    interruptible: settings.voice.interruptible,
    keepTranscripts: settings.privacy.keepTranscripts,
    rememberMisconceptions: settings.privacy.rememberMisconceptions,
    personalizeDiscover: settings.privacy.personalizeDiscover,
    onboardedAt: ago(20 * DAY),
  };
  await db.learnerSettings.upsert({
    where: { userId },
    create: { userId, ...learnerSettings },
    update: learnerSettings,
  });
  await db.userInterest.deleteMany({ where: { userId } });
  await db.userInterest.createMany({
    data: settings.interests
      .filter((i) => i.selected)
      .map((i) => ({ userId, topicId: topicIds.get(i.topic)! })),
  });

  return { sessions: sessionIds.size, concepts: userConcepts.size };
}

async function resolveUser(email: string | undefined) {
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new Error(
        `No user with email ${email}. Sign in once with Google first.`,
      );
    return user;
  }
  const users = await prisma.user.findMany({ take: 2 });
  if (users.length === 1) return users[0];
  if (users.length > 1)
    console.log("Several users exist; pass --email to seed learner data.");
  return null;
}

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      reset: { type: "boolean", default: false },
    },
  });

  const catalog = await seedCatalog();
  console.log(
    `Catalog: ${catalog.topicIds.size} topics, ${catalog.blockIds.size} blocks, ${catalog.conceptIds.size} concepts.`,
  );

  const user = await resolveUser(values.email);
  if (!user) return;

  if (
    !values.reset &&
    (await prisma.learningSession.count({ where: { userId: user.id } }))
  ) {
    console.log(
      `${user.email} already has learning data; rerun with --reset to replace it.`,
    );
    return;
  }

  // One transaction, so a failed run never leaves a half-seeded learner behind.
  const seeded = await prisma.$transaction(
    async (tx) => {
      if (values.reset) await resetLearner(tx, user.id);
      return seedLearner(tx, user.id, catalog);
    },
    { timeout: 180_000, maxWait: 20_000 },
  );
  console.log(
    `Learner ${user.email}: ${seeded.sessions} sessions, ${seeded.concepts} concepts.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

# Wonderstruck Design Direction

## Overview

**Quiet interface. Vivid curiosity. A warm companion.**

Wonderstruck should feel like a calm place to explore fascinating ideas, not a social feed competing for attention. Its visual identity combines a minimalist dark shell, softly squared squircle surfaces, tactile key-press buttons, immersive learning imagery, and Mira, a friendly white owl.

This brief describes the intended taste and the tokens already implemented in `app/globals.css`. The learner dashboard (`/dashboard`) is the first reference surface; it uses mock data only.

The dashboard follows a friendly learning-app layout (labeled sidebar, illustrated greeting hero, tinted mode tiles, and a right rail of personal learning panels), rendered **dark-first**. Borrow that structure, not engagement mechanics: streaks, leaderboards, gems, and public counts are replaced by recall, sessions, and the learning graph.

**Two distinct identities:**

- **Wonderstruck logo:** a text-only wordmark, "**Wonder**struck", with "Wonder" in Mira cream (`--primary`) and "struck" in the foreground colour. No owl and no tagline beside it. The favicon (`app/icon.png`) stays Mira's face on a transparent canvas, because the full body is unreadable at favicon size.
- **Mira:** a soft white owl with a rounded head and body, large warm brown eyes, subtle beige feather markings, and a small dark beak and feet. The full-body owl (`public/brand/mira-owl.png`) is the main mascot for greeting and companion moments; the face (`mira-head.png`) is only the favicon. There is no round owl avatar: show the owl at most once per view, and attribute Mira's messages with a cream "Mira" label and a thin cream rule instead. Logo and mascot are one character. Preserve its curious, welcoming expression.

## Colors

Use a near-black foundation with gently lighter neutral surfaces, off-white primary text, and readable secondary text. The result should feel soft and spacious rather than harsh or washed out.

Let educational imagery supply the richest color: forest greens, space purples, ocean blues, and planetary oranges belong primarily to content. **Mira cream** (`--primary`, `oklch(0.9 0.05 82)`, matched to the owl's feathers) is the brand and hero accent: the wordmark, the greeting hero, Today in the nav, Continue exploring, and the search glow. Every other destination carries its own matching **section accent**, applied with a scoping class (`accent-blue`, `accent-green`, `accent-violet`, `accent-teal`, `accent-rose` in `globals.css`) that remaps `--primary`, `--primary-edge`, `--primary-ink`, and `--ring` for that subtree: Discover is blue (`--tint-blue`), Sessions green (`--tint-green`), Recall violet (`--tint-violet`), Graph teal (`--tint-teal`), and Saved rose (`--tint-rose`). `PageFrame`, `SectionHeading`, and `NavItem` take an `accent`; the active nav item and section links pick up that hue. Honey (`--tint-honey`) remains a supporting warm tint (Explore with Mira, Spaced out). All tints share similar lightness and chroma so they read as one family; use them at low opacity for tile backgrounds and borders and at full strength only for small key icons, counts, and progress. Concept states: demonstrated is violet, practiced teal. There is no orange token; orange belongs only to content imagery. Do not add hues beyond this set.

Keep semantic feedback distinct from branding. Success, warning, and error states require labels or icons as well as color. Validate contrast rather than assuming pale text or muted borders are readable on dark surfaces.

During implementation, define semantic CSS variables for background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, and focus ring. Map shadcn and Tailwind to those same tokens. Do not duplicate palette definitions in components.

The background is a slightly blue-tinted near-black. The initial direction is dark-first. Dark is the default. A light theme (warm paper background, slate text, a light golden-cream `--primary` fill with dark text, near-black primary key) lives in `:root`, with the dark tokens in `.dark`, switched by `next-themes` (class attribute, system supported). The theme control offers Light, Dark and System: an icon button opening a small menu in the mobile header and on public pages, and an inline three-icon segmented row (Theme) in the account menu, and Settings has an Appearance control (System, Light, Dark). Hairlines and hover washes use the `--ink` token (`ink/…`: white on dark, slate on light), never `white/…`, except over imagery. Shadows use `--shadow-color` (black on dark, warm brown on light) scaled by `--shade`. In light, secondary keys are white faces on a warm edge with a soft ambient shadow (`--key-ambient`), the primary key sits on a charcoal edge rather than black, glass gains a soft warm drop shadow (`--glass-shadow`), and disabled primary keys turn a pale warm grey. Cream text, links, active nav and progress fills use `--primary-ink` (`text-primary-ink`), a deeper gold that stays legible on paper; `--primary` stays reserved for fills. Mode tiles use white glyphs on every key in both themes; each key has a mid-tone `--face` per theme and an edge mixed from it. Active nav icons inherit the label colour. The learning graph panels stay dark in both themes (`dark` class on the panel).

## Typography

Use **Allo** (the `allo-font` package, a variable font from 100 to 900 with obliques) for all interface and heading text, with Geist Mono only for code. Roundness is dialled down to `"ROND" 20` on `html` (the axis runs 0 sharp to 100 round, default 50) for a crisper, less bubbly read. Weights stay light: body is regular (400), labels and emphasis medium (500), headlines and titles semibold (600); do not use bold (700) or heavier. Headlines are semibold with the font's default letter spacing (for example the greeting at about 46px, leading 1.08). **Never tighten letter spacing**: no negative `tracking-*` anywhere. Section titles are semibold and modest in size; metadata uses the muted foreground. Avoid ornamental display typography or a separate font for every feature.

Page titles should orient, card titles should provoke curiosity, and body copy should support sustained understanding. Discover block bodies are told as short stories: open with "Imagine…", lean on everyday analogies, then land the real mechanism and any caveats. Prefer moderate weights and short headings over oversized type on every screen.

Keep reading and transcripts around 60-75 characters per line where space permits. Start body text near 16px with generous leading; secondary metadata may be smaller but must remain readable. Avoid mobile input text small enough to trigger browser zoom.

Use plain, supportive language: "Explore with Mira", "Resume session", "Review this concept". Explain errors and what the learner can do next. Do not use guilt, streak pressure, exaggerated mastery claims, or fabricated statistics.

## Layout

Use whitespace and alignment before adding boxes. Keep one clear primary action in each task context. The shell should recede while the learning content leads.

On desktop, use a labeled sidebar (brand, primary destinations, and a single learner row below a hairline: avatar, the name on one line (ellipsis when long) and an up-down chevron; the whole row opens an account menu above it (Settings, the Theme row with Light / Dark / System, then Sign out after a hairline); no stat boxes or concept counts). The avatar is the learner's Google photo, falling back to initials on a cream wash; identity streams in behind Suspense with a same-size neutral placeholder so the chrome never shifts. Sign out is the last item of the sidebar account menu, the last item of the mobile account menu (after a hairline), and a labelled button in the Settings profile row. The layout has a search top bar, a main column, and a right rail (about 21.5rem) for recall, recent sessions, and the graph snapshot. Grid columns use `minmax(0, 1fr)` so horizontal scrollers cannot widen the page. Discover can be image-led, but it should retain a readable column rather than become a wall of equally weighted tiles. The learning workspace splits reading (`/learn`) from the live session canvas (`/explore/[blockId]`).

On mobile web, use a single-column layout, a compact header, and labeled primary navigation with overflow access to remaining destinations. Respect safe areas and reserve space for fixed controls. Do not recreate an iPhone frame or its status bar inside the browser.

| Surface | Layout character |
| --- | --- |
| Discover | Image-led learning cards, concise topic controls, clear explore/save actions; no forced full-screen snapping |
| Learning workspace | Content, activity, and Mira remain connected to the current session; narrow layouts use explicit views without losing state |
| Saved | Browseable grid or list; a stacked-card carousel must not be the only access path |
| Sessions and recaps | Calm chronological history and structured reading; easy resume and review entry points |
| Active recall | One focused question, clear answer controls, explanatory feedback, and visible review progress |
| Learning graph | Spacious concept connections, selected-node details, session provenance, and an equivalent accessible list |
| Settings | Quiet labeled rows and forms with explicit privacy and deletion controls |

Keep graph controls usable without precision dragging. On small screens, prefer a selected concept and its neighborhood over shrinking the entire graph.

## Elevation & Depth

Surfaces use tonal separation and quiet borders, not large shadows. The deliberate exception is the **key**: primary, secondary, and outline buttons (and mode-tile icons) sit on a short solid bottom edge (`--key-edge`, 4px) with a faint inset top highlight. The primary key is **white** (`--key`, dark text, grey `--key-edge-color`), never the accent colour. The **secondary key is glass** (white/7% fill, white/12% border, backdrop blur, and a visible mid-grey key edge so it presses like the primary); `outline` renders identically. Secondary sits beside primary at the **same height (default h-10)**; do not shrink it to `sm`. Save toggles use the secondary key too. They lift 1px on hover (hover-capable devices only) and press flush on click. Disabled keys flatten; reduced motion removes the travel. Ghost buttons stay flat. Reserve other elevation for dialogs, popovers, and genuinely floating elements.

Imagery may feel immersive; utility UI should stay mostly flat. Use image overlays only to protect text contrast, and provide a text-first fallback when an asset is missing.

**Glass** (the `glass` utility: faint white gradient, 1px white/9% border, inset top highlight, `backdrop-blur(24px) saturate(1.5)`) is used for floating chrome and browsable content: and the floating sidebar panel. The light page background is pure white. The mobile header and bottom nav are lightly frosted in light (`bg-white/85`, `backdrop-blur-sm`, hairline border); in dark they are glass (near-black `oklch(0.115 0.006 265 / 0.62)`, `backdrop-blur-2xl saturate-150`, white/8% hairline). The session composer box and the mobile account menu stay solid (`bg-popover`, no blur) in both. Discover, Saved and Curated for you cards are full-bleed photographs: the image is the card, a deep bottom scrim carries the topic, title, caption and actions in white, and the overlay is scoped `dark` so keys keep dark-theme colours on the photo. The sidebar uses the denser `glass-panel` variant (tinted dark base, stronger blur) so it reads as frosted rather than see-through. The page background stays plain dark: no ambient blobs or coloured glows. Do not glass reading surfaces, recall questions, or forms.

The **greeting hero** uses `hero-sky`: a minimal warm-cream gradient that echoes Mira's feathers, with a faint honey wash from the owl's markings; every `hero-sky` panel (Today greeting, landing hero, landing CTA) also carries a `hero-inset` overlay: an inner shadow that sinks the edges into a soft pocket under a lit top lip (on its own layer because the sky's blurred fields paint over the element's own inset shadow); its tones shift with the time of day (morning, afternoon, evening, night), set by an inline head script on `<html data-daypart>` so there is no flash or hydration mismatch. Two oversized blurred colour fields drift slowly behind it (16s and 21s loops) for a flowing, liquid feel; they stop under reduced motion. The greeting text switches with it ("Good morning", "Good afternoon", "Good evening", "Still curious," at night). The hero is a size container: when narrow (phones, tablets, or a squeezed desktop column) it centres Mira above the greeting with full-width or paired equal buttons; from `@2xl` it switches to text left with the large owl on the right, so the owl never overlaps copy.

A subtle accent glow identifies exactly one focal card: **Continue exploring** (cream border tint, soft cream outer glow). Avoid glowing screen outlines, rainbow gradients, and layered effects that compete with reading.

Mira herself never casts a drop shadow or halo in light mode; both are dark-only so the owl sits clean on white.

**Lit surfaces** (`surface`: card colour with a soft radial top light, white/8% border, inset highlight) hold solid content: rail cards, session rows, recap sections, recall. In light mode (pure white page) these surfaces, glass, `glow-soft` and `glow-under` swap to a layered warm elevation (`--elev-1`; the sidebar and `lift` hover use the deeper `--elev-2`) so boxes are clearly visible. `lift` raises browsable cards 3px with a faint cream glow on hover (static under reduced motion). `glow-soft` marks the single featured card in a rail. `glow-under` adds a soft cream glow under the bottom edge only (not around); the top-bar search and, in light mode, the Continue exploring card share it (the Continue card glows and fills its progress bar in Mira cream `--primary`, not the darker ink) (`border-primary/70` in light, `/25` in dark). In dark, both use the softer, diffuse cream glow instead. `icon-key` is a tinted 3D icon tile driven by `--chip`; its bottom edge mixes the chip into the page colour (`--icon-edge-base`: white in light, near-black in dark), so it reads as a soft tinted glow in both themes rather than a grey drop shadow. Numbered list badges (recap key ideas) set `--chip: var(--primary-ink)` so the digit stays legible on the pale light-mode tint.

Do not wrap every recap paragraph, transcript message, or settings row in another elevated card.

## Shapes

**Squircles are the shared form language.** Cards, panels, topic tiles, and compact controls should feel softly squared, not sharp, overly pill-shaped, or inflated.

Establish a small shared corner scale rather than choosing a different radius for each component. Use continuous-corner treatment where browser support allows, with an ordinary rounded-corner fallback. Shape enhancement must not be required for functionality.

Keep focus rings outside clipping regions. Separate image clipping from interactive containers when needed. Circles remain appropriate for avatars; pills are appropriate for compact chips, not every surface.

Buttons are squircles too (`squircle-sm`), never pills. Mira's soft silhouette complements this geometry. Use the full mascot in greeting and companion moments, never as a repeated profile avatar. Use transparent-background artwork.

## Components

### Foundation and custom library

Use **shadcn/ui with Tailwind CSS**, then build a small in-repository Wonderstruck layer on top. shadcn provides interaction primitives; Wonderstruck provides its shared visual language and learning-specific compositions. Do not ship unmodified generic dashboard styling as the product identity.

Planned ownership:

- `components/ui/`: only the shadcn primitives actually needed, with shared token-based styling.
- `components/wonderstruck/`: reusable branded elements and learning compositions.
- `app/globals.css`: semantic theme, typography, spacing, shape, and focus tokens mapped into Tailwind.
- `lib/utils.ts`: the generated class-merging utility where required by shadcn.

Keep this a simple local library, not a separately published package or a second UI framework. Customize a primitive in place when that is sufficient; add a wrapper only when it contributes a stable brand or product behavior. Keep data fetching, AI orchestration, and learner business rules outside purely visual primitives.

Preserve underlying accessibility, keyboard behavior, refs, and supported composition APIs. Expose a few meaningful variants rather than dozens of styling props. Add client boundaries only where interactive behavior requires them.

### Initial component vocabulary

| Component | Responsibility |
| --- | --- |
| Brand mark and Mira | Text-only wordmark ("Wonder" in cream, no tagline); full-body owl as mascot, no round avatar; decorative images avoid redundant announcements |
| Surface | Shared squircle panel geometry and restrained tonal/border treatment |
| Learning card | Image, curiosity-led title, topic, sources entry point, and clear actions |
| Topic chip | Compact, visibly selectable topic control with accessible state |
| Navigation item | Icon plus label with clear active and focus states |
| Button and icon button | Squircle keys: white primary, secondary, outline, flat ghost, destructive; visible loading and disabled states |
| Mode tile | Tinted squircle tile with a key-styled icon, label, short status, and arrow |
| Form field | Persistent label, hint, validation message, and focus treatment |
| Voice controls | Start, stop, mute, and labeled listening/thinking/speaking/reconnecting states |
| Session/recap section | Saved status, structured summary, evidence links, and resume/retry actions; in compact lists a failed recap shows an inline "Retry" text action in the meta line, never a button that squeezes the title |
| Recall question | Answer selection/input, submission, explanation, and next-review feedback |
| Concept detail | Semantic connection labels, supporting sessions, and graph/list navigation |
| Empty/error state | Concise explanation and a real next action; mascot only when it adds warmth |

Mira should appear deliberately in onboarding, companion presence, and selected supportive states. Do not put the owl on every card or use disappointed expressions to manipulate the learner.

Voice state must be understandable without mascot animation. Keep stop and mute reachable, distinguish microphone disconnection from finishing a learning session, and announce important state changes without continuously reading streaming text.

Keep motion brief and purposeful. Hover, press, selection, and view changes should clarify feedback; avoid persistent bouncing, decorative graph motion, or autoplay. Respect reduced-motion preferences and support touch without sticky hover reliance.

### Page patterns

- **Frame:** every page, including the dashboard, uses one width (the whole app shell is capped at 1536px, `max-w-[96rem]`, and centred; `PageFrame` adds the same padding) so titles start at the same place; there is no narrow variant. Pages use `PageHeader` (title, one-sentence purpose, optional actions). Grid and flex children use `min-w-0` so nothing overflows on phones.
- **Rail:** on xl+ screens `WithRail` adds a sticky right rail (22–24rem) of `RailCard`s so wide screens have no dead space. Keep it to two or three items that relate to *this* page (Discover: Ask Mira, saved; Sessions: week summary, recall due; Session detail: its recall, explore next; Explore: resume, sparks; Settings: privacy and data). Never duplicate what the main column already shows. Below xl the rail stacks after the content; on phones only essential cards stay (`RailCard essential={false}` hides summaries, saved lists, recent reviews and similar extras below md, and the dashboard drops Recent sessions), and a `centered` card puts its art on top with centred text instead of the icon key.
- **Discover:** glass learning cards with full-bleed 16:10 images and glass topic/minute chips, staggered `Rise` entrances, topic chips, and a finite feed (never infinite scroll); Ask Mira lives in the rail, not repeated below the feed.
- **Learn (`/learn/[blockId]`):** a reading page. Full-bleed image header with the question overlaid and glass topic/minute chips, a lead paragraph only slightly larger than the body (about 17–18px), a 65ch body (15.5–16px), a modest title (26–38px), a "Try it" bridge into the session's activity, and sources as link tiles. On desktop a simple sticky Mira box sits on the right: the full owl, one line of copy, **Talk with Mira (voice) as the primary action** and Type instead as the secondary. Below `lg` that box becomes a floating "Talk with Mira" pill at the bottom right, above the bottom nav.
- **Session canvas (`/explore/[blockId]` and `/explore`):** the live session. `/explore` (Ask Mira anything) uses the same frame and `SessionCanvas`, opening with Mira's greeting and starter questions as chips; its right column holds Pick up where you left off and Or start from a spark. The middle is transparent, not a chat window: the conversation reads as open, left-aligned captions (Mira's larger, yours muted), with the full-body Mira standing small (about 44px) in a narrow left gutter, aligned to the top of her latest reply only; on phones there is no gutter: turns run full width and a smaller Mira (28px) sits inline beside her name label, and inline activity cards drop their gutter indent too (tighter 16px padding) (soft cream halo that breathes while listening, dark mode only). Activities Mira sets up sit inline in the same scrolling flow. A voice-first control is pinned at the bottom: one 64px squircle 3D primary speak key (52px on phones, with 40px side keys and tighter gaps so more of the conversation shows) in the centre, "Tap to talk" on its left when idle; while live a mute key takes that spot and the status ("Listening · preview" with the waveform, or "Muted") sits centred beneath; a small keyboard key on its right; 24px between keys; the keyboard key swaps in a row of mic key, squircle field and send key, all the same 48px height (the field grows for multiple lines) (Escape on an empty field also returns). Suggestion chips sit centred above. The right column holds Sources, "In this session" concepts with evidence badges, and Explore next. Desktop fits the viewport with the canvas scrolling internally; mobile gives the canvas the full screen height, with the composer in a solid, full-width box (bar colour, hairline top border, no side margin) sticky flush on top of the bottom nav (20px of breathing room below the speak key's edge) and the rail below. In the session header, 3D keys sit 2px higher (half their edge depth) so the key plus its edge is optically centred against the flat thumbnail, title and Preview pill. Resume and activity links open here; `/sessions/[id]` stays the recap.
- **Mira preview:** every Mira surface shows a "Preview" badge and an honest "not connected" reply until live voice exists. Voice states are labelled, not just animated.
- **Sessions:** "This week" summary first, then grouped lists; detail pages separate discussed, practiced, and demonstrated, with the transcript collapsed.
- **Recall:** one question at a time with progress, ending in a calm "All caught up". The memory list lets learners remove what Mira remembers.
- **Graph:** map and list views of the same data, a legend, and a detail panel. Dashed teal-family links mean "related in meaning, not a prerequisite"; labels carry a dark halo so edges never cut through text. The map is laid out with a force simulation (`lib/graph-layout.ts`, d3-force) that keeps each label box clear of every other node and label, then fits the view to the result, so dense graphs spread out rather than overlap.
- **Settings:** plain grouped form; switches with persistent labels and hints.
- **Landing (`/`):** a persuasion page outside the app shell (wordmark, theme toggle and Sign in on top). The `hero-sky` hero keeps "Less doomscrolling. More wondering." with Mira standing alone on the hero's bottom edge (nothing drawn over her) and named in the lead copy. Then a plain-language positioning line ("Not another feed. Not another course.") and one alternating row per core feature, each a simple promise beside a picture of the product doing it: Discover (two real `LearningCard`s), Talk it through with Mira (the real `SessionCanvas` in its `embedded` mode), Learn it by doing it (the real, playable `ActivityView`), Remember it for good (recap stacked above the real `RecallCard`, with a clear gap, never overlapping) and Watch your knowledge connect (the real `GraphSnapshot`). Previews reuse app components rather than copies, so the landing always matches the product. Each row takes its section colour: the key icon and a tinted stage behind the preview (a soft radial wash of the hue with a matching hairline), plus the `accent-*` class so links and progress inside follow it. Discover is blue, Mira honey, Interact green, Remember violet, Graph teal. On desktop the preview column is wider than the copy (1.3 : 1) so the product pictures lead. It closes with three "smarter, not hooked" principles as separate `Tinted` tiles (green, rose, violet) with real gaps between them, and a cream sky CTA band; cream stays on the hero and CTA only. Copy stays short and everyday; previews read demo content from `lib/data` (`components/wonderstruck/landing.tsx`).
- **Login (`/login`):** a centred column with Mira, one heading, Continue with Google (Better Auth `signIn.social`), errors in an alert line and a short privacy note. App pages are not gated yet.

### Data layer

Components receive data as props; pages fetch it from `lib/data`. `lib/data/types.ts` defines the domain types and the `DataSource` interface, `lib/data/mock` implements it with fixtures, and `lib/data/index.ts` is the single swap point. Components never import fixtures directly.

### Quality floor

Target WCAG 2.2 AA. Maintain visible keyboard focus, meaningful labels, usable touch targets, transcripts, and accessible alternatives for imagery and graph interactions. A roughly 44px primary touch-target size is a useful implementation default.

Every relevant component must handle loading, empty, error, retry, disabled, overflow, and long-content states. Distinguish in-progress generation from saved success. Never show fabricated recap, recall, or graph results to conceal a failure.

Loading skeletons (`components/wonderstruck/skeletons.tsx`, shared by each route's `loading.tsx` and its client view) mirror the real layout: static chrome (headers, rail titles, legends, explainer sections) renders as-is and only data-backed parts become `Bone`/`TextBone` shapes at their real sizes, so nothing shifts when data lands. Content that replaces a skeleton settles in place (`Settled` suppresses the `Rise` entrance) instead of animating twice.

## Do's and Don'ts

**Do** make curiosity vivid and controls quiet. Use shared tokens and components, accurate content, readable sources, gentle owl presence, and responsive layouts that preserve session context.

**Do** keep sessions, recaps, active recall, and concept connections first-class, even though the UI reference does not depict them.

**Don't** copy the reference's public likes, downloads, notification badges, streak rewards, sample profile statistics, or phone chrome into feature scope.

**Don't** introduce another logo, use a different owl per screen, tighten letter spacing, glow more than one card, glass reading surfaces, nested cards everywhere, icon-only primary navigation, or generic analytics-dashboard decoration.

**Don't** equate a pretty graph with mastery, an illustration with factual evidence, or a long session with successful learning.

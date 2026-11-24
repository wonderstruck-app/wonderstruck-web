// Static demo content for the public landing page. Visitors are signed out, so this never
// touches the API; signed-in pages read through `lib/data` instead.

import { conceptLinks, concepts, blocks, sessions } from "./mock/fixtures";
import { recallWithAnswers } from "./mock";
import type { LearningGraph } from "./types";

export const showcaseBlocks = blocks;

export const showcaseGraph: LearningGraph = {
  concepts,
  links: conceptLinks,
  sessions: sessions.map(({ id, title }) => ({ id, title })),
};

export const showcaseRecall = recallWithAnswers();

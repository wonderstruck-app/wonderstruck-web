"use client";

import { useState } from "react";
import type { BlockCard, Topic } from "@/lib/data";
import { Rise } from "./rise";
import { LearningCard } from "./learning-card";
import { TopicFilter } from "./topic-filter";

export function DiscoverFeed({
  blocks,
  savedIds,
}: {
  blocks: BlockCard[];
  savedIds: string[];
}) {
  const topics = [...new Set(blocks.map((b) => b.topic))].sort();
  const [topic, setTopic] = useState<Topic | null>(null);
  const shown = topic ? blocks.filter((b) => b.topic === topic) : blocks;

  return (
    <>
      <TopicFilter topics={topics} value={topic} onChange={setTopic} />
      <ul className="mt-6 grid gap-5 md:grid-cols-2" aria-label="Learning blocks">
        {shown.map((b, i) => (
          <Rise as="li" order={Math.min(i, 6)} key={b.id}>
            <LearningCard
              block={b}
              saved={savedIds.includes(b.id)}
              priority={i === 0}
            />
          </Rise>
        ))}
      </ul>
    </>
  );
}

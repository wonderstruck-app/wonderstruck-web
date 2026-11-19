"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SavedBlock, Topic } from "@/lib/data";
import { EmptyState } from "./empty-state";
import { LearningCard } from "./learning-card";
import { Rise } from "./rise";
import { TopicFilter } from "./topic-filter";

export function SavedGrid({ saved }: { saved: SavedBlock[] }) {
  const topics = [...new Set(saved.map((s) => s.block.topic))].sort();
  const [topic, setTopic] = useState<Topic | null>(null);
  const shown = topic ? saved.filter((s) => s.block.topic === topic) : saved;

  if (saved.length === 0)
    return (
      <EmptyState
        title="Nothing saved yet"
        action={
          <Button asChild>
            <Link href="/discover">Open Discover</Link>
          </Button>
        }
      >
        Tap Save on anything in Discover and it waits here until you have time.
      </EmptyState>
    );

  return (
    <>
      <TopicFilter topics={topics} value={topic} onChange={setTopic} />
      <ul className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {shown.map(({ block, savedLabel }, i) => (
          <Rise as="li" order={Math.min(i, 6)} key={block.id}>
            <LearningCard block={block} saved priority={i === 0} meta={savedLabel} />
          </Rise>
        ))}
      </ul>
    </>
  );
}

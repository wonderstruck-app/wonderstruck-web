-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "voice_pace" AS ENUM ('relaxed', 'natural', 'brisk');

-- CreateEnum
CREATE TYPE "block_status" AS ENUM ('draft', 'published', 'retired');

-- CreateEnum
CREATE TYPE "block_event_kind" AS ENUM ('impression', 'open', 'read', 'save', 'unsave', 'dismiss', 'explore');

-- CreateEnum
CREATE TYPE "activity_kind" AS ENUM ('predict', 'order', 'simulate');

-- CreateEnum
CREATE TYPE "activity_origin" AS ENUM ('authored', 'generated');

-- CreateEnum
CREATE TYPE "attempt_outcome" AS ENUM ('solved', 'retried', 'skipped');

-- CreateEnum
CREATE TYPE "session_status" AS ENUM ('active', 'finished', 'abandoned');

-- CreateEnum
CREATE TYPE "message_role" AS ENUM ('mira', 'learner');

-- CreateEnum
CREATE TYPE "message_via" AS ENUM ('voice', 'text');

-- CreateEnum
CREATE TYPE "recap_status" AS ENUM ('generating', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "concept_edge_kind" AS ENUM ('semantic', 'prerequisite');

-- CreateEnum
CREATE TYPE "concept_state" AS ENUM ('discussed', 'practiced', 'demonstrated');

-- CreateEnum
CREATE TYPE "evidence_kind" AS ENUM ('discussed', 'practiced', 'demonstrated', 'missed');

-- CreateEnum
CREATE TYPE "evidence_source" AS ENUM ('message', 'activity', 'recall');

-- CreateEnum
CREATE TYPE "recall_state" AS ENUM ('new', 'learning', 'review', 'relearning', 'retired');

-- CreateEnum
CREATE TYPE "review_outcome" AS ENUM ('recalled', 'missed');

-- CreateEnum
CREATE TYPE "memory_kind" AS ENUM ('interest', 'misconception', 'preference');

-- CreateEnum
CREATE TYPE "ai_task" AS ENUM ('live_tutor', 'text_tutor', 'recap', 'recall_generation', 'activity_generation', 'concept_extraction', 'embedding');

-- CreateEnum
CREATE TYPE "job_status" AS ENUM ('queued', 'running', 'succeeded', 'failed', 'dead');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ(3),
    "refresh_token_expires_at" TIMESTAMPTZ(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_settings" (
    "user_id" TEXT NOT NULL,
    "voice_id" TEXT NOT NULL DEFAULT 'mira',
    "voice_pace" "voice_pace" NOT NULL DEFAULT 'natural',
    "interruptible" BOOLEAN NOT NULL DEFAULT true,
    "keep_transcripts" BOOLEAN NOT NULL DEFAULT true,
    "remember_misconceptions" BOOLEAN NOT NULL DEFAULT true,
    "personalize_discover" BOOLEAN NOT NULL DEFAULT true,
    "onboarded_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "learner_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_interest" (
    "user_id" TEXT NOT NULL,
    "topic_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_interest_pkey" PRIMARY KEY ("user_id","topic_id")
);

-- CreateTable
CREATE TABLE "topic" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_block" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "topic_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "teaser" TEXT NOT NULL,
    "body" TEXT[],
    "minutes" INTEGER NOT NULL,
    "image_src" TEXT NOT NULL,
    "image_alt" TEXT NOT NULL,
    "status" "block_status" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "learning_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_source" (
    "id" UUID NOT NULL,
    "block_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "block_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_concept" (
    "block_id" UUID NOT NULL,
    "concept_id" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "block_concept_pkey" PRIMARY KEY ("block_id","concept_id")
);

-- CreateTable
CREATE TABLE "saved_block" (
    "user_id" TEXT NOT NULL,
    "block_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_block_pkey" PRIMARY KEY ("user_id","block_id")
);

-- CreateTable
CREATE TABLE "block_event" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "block_id" UUID NOT NULL,
    "kind" "block_event_kind" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "block_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity" (
    "id" UUID NOT NULL,
    "kind" "activity_kind" NOT NULL,
    "origin" "activity_origin" NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "spec" JSONB NOT NULL,
    "block_id" UUID,
    "session_id" UUID,
    "model" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_attempt" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "outcome" "attempt_outcome" NOT NULL,
    "response" JSONB NOT NULL,
    "correct" BOOLEAN,
    "note" TEXT,
    "client_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_session" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "block_id" UUID,
    "title" TEXT NOT NULL,
    "status" "session_status" NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(3),
    "active_seconds" INTEGER NOT NULL DEFAULT 0,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "learning_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_message" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "seq" INTEGER NOT NULL,
    "role" "message_role" NOT NULL,
    "via" "message_via" NOT NULL,
    "text" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recap" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "recap_status" NOT NULL DEFAULT 'generating',
    "summary" TEXT,
    "key_ideas" JSONB,
    "open_questions" TEXT[],
    "next_steps" TEXT[],
    "model" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "recap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concept" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "topic_id" UUID,
    "embedding" vector(1536),
    "embedding_model" TEXT,
    "embedded_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concept_edge" (
    "from_id" UUID NOT NULL,
    "to_id" UUID NOT NULL,
    "kind" "concept_edge_kind" NOT NULL,
    "similarity" REAL,
    "rationale" TEXT NOT NULL,
    "model" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concept_edge_pkey" PRIMARY KEY ("from_id","to_id","kind")
);

-- CreateTable
CREATE TABLE "user_concept" (
    "user_id" TEXT NOT NULL,
    "concept_id" UUID NOT NULL,
    "state" "concept_state" NOT NULL,
    "first_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_evidence_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_concept_pkey" PRIMARY KEY ("user_id","concept_id")
);

-- CreateTable
CREATE TABLE "session_concept" (
    "session_id" UUID NOT NULL,
    "concept_id" UUID NOT NULL,
    "state" "concept_state" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_concept_pkey" PRIMARY KEY ("session_id","concept_id")
);

-- CreateTable
CREATE TABLE "concept_evidence" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "concept_id" UUID NOT NULL,
    "session_id" UUID,
    "kind" "evidence_kind" NOT NULL,
    "source" "evidence_source" NOT NULL,
    "source_id" UUID NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concept_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recall_item" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "concept_id" UUID NOT NULL,
    "session_id" UUID,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correct_option_id" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "model" TEXT,
    "state" "recall_state" NOT NULL DEFAULT 'new',
    "due_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "last_reviewed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "recall_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recall_review" (
    "id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "outcome" "review_outcome" NOT NULL,
    "chosen_option_id" TEXT NOT NULL,
    "response_ms" INTEGER,
    "previous_due_at" TIMESTAMPTZ(3) NOT NULL,
    "next_due_at" TIMESTAMPTZ(3) NOT NULL,
    "client_id" TEXT NOT NULL,
    "reviewed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recall_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_memory" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" "memory_kind" NOT NULL,
    "text" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "session_id" UUID,
    "concept_id" UUID,
    "resolved_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "learner_memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage" (
    "id" UUID NOT NULL,
    "user_id" TEXT,
    "session_id" UUID,
    "task" "ai_task" NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "input_tokens" INTEGER NOT NULL DEFAULT 0,
    "output_tokens" INTEGER NOT NULL DEFAULT 0,
    "audio_seconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost_usd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job" (
    "id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "job_status" NOT NULL DEFAULT 'queued',
    "dedupe_key" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "run_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked_at" TIMESTAMPTZ(3),
    "locked_by" TEXT,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "session"("user_id");

-- CreateIndex
CREATE INDEX "account_user_id_idx" ON "account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_id_account_id_key" ON "account"("provider_id", "account_id");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "topic_slug_key" ON "topic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "learning_block_slug_key" ON "learning_block"("slug");

-- CreateIndex
CREATE INDEX "learning_block_status_published_at_id_idx" ON "learning_block"("status", "published_at" DESC, "id");

-- CreateIndex
CREATE INDEX "learning_block_topic_id_idx" ON "learning_block"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "block_source_block_id_position_key" ON "block_source"("block_id", "position");

-- CreateIndex
CREATE INDEX "block_concept_concept_id_idx" ON "block_concept"("concept_id");

-- CreateIndex
CREATE INDEX "saved_block_user_id_created_at_idx" ON "saved_block"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "block_event_user_id_created_at_idx" ON "block_event"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "block_event_block_id_idx" ON "block_event"("block_id");

-- CreateIndex
CREATE INDEX "activity_block_id_idx" ON "activity"("block_id");

-- CreateIndex
CREATE INDEX "activity_session_id_idx" ON "activity"("session_id");

-- CreateIndex
CREATE INDEX "activity_attempt_session_id_created_at_idx" ON "activity_attempt"("session_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "activity_attempt_user_id_client_id_key" ON "activity_attempt"("user_id", "client_id");

-- CreateIndex
CREATE INDEX "learning_session_user_id_last_activity_at_idx" ON "learning_session"("user_id", "last_activity_at" DESC);

-- CreateIndex
CREATE INDEX "learning_session_user_id_block_id_idx" ON "learning_session"("user_id", "block_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_message_session_id_seq_key" ON "session_message"("session_id", "seq");

-- CreateIndex
CREATE UNIQUE INDEX "session_message_session_id_client_id_key" ON "session_message"("session_id", "client_id");

-- CreateIndex
CREATE UNIQUE INDEX "recap_session_id_version_key" ON "recap"("session_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "concept_slug_key" ON "concept"("slug");

-- CreateIndex
CREATE INDEX "concept_topic_id_idx" ON "concept"("topic_id");

-- CreateIndex
CREATE INDEX "concept_edge_to_id_idx" ON "concept_edge"("to_id");

-- CreateIndex
CREATE INDEX "user_concept_concept_id_idx" ON "user_concept"("concept_id");

-- CreateIndex
CREATE INDEX "session_concept_concept_id_idx" ON "session_concept"("concept_id");

-- CreateIndex
CREATE INDEX "concept_evidence_user_id_concept_id_created_at_idx" ON "concept_evidence"("user_id", "concept_id", "created_at");

-- CreateIndex
CREATE INDEX "concept_evidence_session_id_idx" ON "concept_evidence"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "concept_evidence_concept_id_source_source_id_kind_key" ON "concept_evidence"("concept_id", "source", "source_id", "kind");

-- CreateIndex
CREATE INDEX "recall_item_user_id_state_due_at_idx" ON "recall_item"("user_id", "state", "due_at");

-- CreateIndex
CREATE INDEX "recall_item_concept_id_idx" ON "recall_item"("concept_id");

-- CreateIndex
CREATE INDEX "recall_review_user_id_reviewed_at_idx" ON "recall_review"("user_id", "reviewed_at" DESC);

-- CreateIndex
CREATE INDEX "recall_review_item_id_idx" ON "recall_review"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "recall_review_user_id_client_id_key" ON "recall_review"("user_id", "client_id");

-- CreateIndex
CREATE INDEX "learner_memory_user_id_kind_idx" ON "learner_memory"("user_id", "kind");

-- CreateIndex
CREATE INDEX "ai_usage_user_id_created_at_idx" ON "ai_usage"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_usage_created_at_idx" ON "ai_usage"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "job_dedupe_key_key" ON "job"("dedupe_key");

-- CreateIndex
CREATE INDEX "job_status_run_at_idx" ON "job"("status", "run_at");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_settings" ADD CONSTRAINT "learner_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interest" ADD CONSTRAINT "user_interest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interest" ADD CONSTRAINT "user_interest_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_block" ADD CONSTRAINT "learning_block_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_source" ADD CONSTRAINT "block_source_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "learning_block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_concept" ADD CONSTRAINT "block_concept_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "learning_block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_concept" ADD CONSTRAINT "block_concept_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_block" ADD CONSTRAINT "saved_block_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_block" ADD CONSTRAINT "saved_block_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "learning_block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_event" ADD CONSTRAINT "block_event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_event" ADD CONSTRAINT "block_event_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "learning_block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "learning_block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attempt" ADD CONSTRAINT "activity_attempt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attempt" ADD CONSTRAINT "activity_attempt_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attempt" ADD CONSTRAINT "activity_attempt_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_session" ADD CONSTRAINT "learning_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_session" ADD CONSTRAINT "learning_session_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "learning_block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_message" ADD CONSTRAINT "session_message_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recap" ADD CONSTRAINT "recap_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept" ADD CONSTRAINT "concept_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_edge" ADD CONSTRAINT "concept_edge_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_edge" ADD CONSTRAINT "concept_edge_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_concept" ADD CONSTRAINT "user_concept_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_concept" ADD CONSTRAINT "user_concept_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_concept" ADD CONSTRAINT "session_concept_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_concept" ADD CONSTRAINT "session_concept_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_evidence" ADD CONSTRAINT "concept_evidence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_evidence" ADD CONSTRAINT "concept_evidence_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_evidence" ADD CONSTRAINT "concept_evidence_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recall_item" ADD CONSTRAINT "recall_item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recall_item" ADD CONSTRAINT "recall_item_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recall_item" ADD CONSTRAINT "recall_item_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recall_review" ADD CONSTRAINT "recall_review_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "recall_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recall_review" ADD CONSTRAINT "recall_review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_memory" ADD CONSTRAINT "learner_memory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_memory" ADD CONSTRAINT "learner_memory_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_memory" ADD CONSTRAINT "learner_memory_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concept"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Hand-written: not expressible in the Prisma schema.

-- Undirected semantic edges are stored once, smaller id first.
ALTER TABLE "concept_edge" ADD CONSTRAINT "concept_edge_ordered_check"
  CHECK ("kind" <> 'semantic' OR "from_id" < "to_id");

-- Nearest-neighbour search over concept embeddings (cosine distance).
CREATE INDEX "concept_embedding_hnsw_idx" ON "concept"
  USING hnsw ("embedding" vector_cosine_ops);

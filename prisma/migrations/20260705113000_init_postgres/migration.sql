-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "fixtures" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "competition_id" TEXT,
    "participant_1" TEXT,
    "participant_2" TEXT,
    "participant_1_is_home" BOOLEAN,
    "start_time" TIMESTAMP(3),
    "status" TEXT,
    "raw_json" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixtures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_updates" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT,
    "source_type" TEXT NOT NULL,
    "source_mode" TEXT NOT NULL,
    "endpoint" TEXT,
    "sequence" TEXT,
    "provider_timestamp" TIMESTAMP(3),
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_json" TEXT NOT NULL,

    CONSTRAINT "feed_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_signals" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT,
    "agent_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "evidence_json" TEXT NOT NULL,
    "source_update_ids" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_results" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "source_update_id" TEXT,
    "stat_key" TEXT,
    "sequence" TEXT,
    "network" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "proof_json" TEXT,
    "result_json" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "fixture_id" TEXT,
    "metadata_json" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "replay_sessions" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "current_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "replay_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fixtures_fixture_id_key" ON "fixtures"("fixture_id");

-- CreateIndex
CREATE INDEX "fixtures_status_idx" ON "fixtures"("status");

-- CreateIndex
CREATE INDEX "fixtures_start_time_idx" ON "fixtures"("start_time");

-- CreateIndex
CREATE INDEX "feed_updates_fixture_id_ingested_at_idx" ON "feed_updates"("fixture_id", "ingested_at");

-- CreateIndex
CREATE INDEX "feed_updates_source_type_source_mode_idx" ON "feed_updates"("source_type", "source_mode");

-- CreateIndex
CREATE INDEX "feed_updates_sequence_idx" ON "feed_updates"("sequence");

-- CreateIndex
CREATE INDEX "agent_signals_fixture_id_created_at_idx" ON "agent_signals"("fixture_id", "created_at");

-- CreateIndex
CREATE INDEX "agent_signals_agent_type_idx" ON "agent_signals"("agent_type");

-- CreateIndex
CREATE INDEX "agent_signals_severity_idx" ON "agent_signals"("severity");

-- CreateIndex
CREATE INDEX "agent_signals_status_idx" ON "agent_signals"("status");

-- CreateIndex
CREATE INDEX "verification_results_fixture_id_created_at_idx" ON "verification_results"("fixture_id", "created_at");

-- CreateIndex
CREATE INDEX "verification_results_status_idx" ON "verification_results"("status");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_event_type_idx" ON "audit_logs"("event_type");

-- CreateIndex
CREATE INDEX "audit_logs_fixture_id_idx" ON "audit_logs"("fixture_id");

-- CreateIndex
CREATE INDEX "audit_logs_level_idx" ON "audit_logs"("level");

-- CreateIndex
CREATE INDEX "replay_sessions_fixture_id_status_idx" ON "replay_sessions"("fixture_id", "status");

-- AddForeignKey
ALTER TABLE "feed_updates" ADD CONSTRAINT "feed_updates_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("fixture_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_signals" ADD CONSTRAINT "agent_signals_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("fixture_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_results" ADD CONSTRAINT "verification_results_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("fixture_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_results" ADD CONSTRAINT "verification_results_source_update_id_fkey" FOREIGN KEY ("source_update_id") REFERENCES "feed_updates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("fixture_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replay_sessions" ADD CONSTRAINT "replay_sessions_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("fixture_id") ON DELETE CASCADE ON UPDATE CASCADE;

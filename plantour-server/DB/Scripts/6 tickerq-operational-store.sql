-- TickerQ operational store objects for Plantour (DB-first)
-- Generated from TickerQOperationalDbContext and adapted to be re-runnable.

-- DO $EF$
-- BEGIN
--     IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'plantour') THEN
--         CREATE SCHEMA plantour;
--     END IF;
-- END $EF$;


CREATE TABLE IF NOT EXISTS plantour."CronTickers" (
    "Id" uuid NOT NULL,
    "Expression" text,
    "Request" bytea,
    "Retries" integer NOT NULL,
    "RetryIntervals" integer[],
    "Function" text,
    "Description" text,
    "InitIdentifier" text,
    "CreatedAt" timestamp without time zone NOT NULL,
    "UpdatedAt" timestamp without time zone NOT NULL,
    CONSTRAINT "PK_CronTickers" PRIMARY KEY ("Id")
);


CREATE TABLE IF NOT EXISTS plantour."TimeTickers" (
    "Id" uuid NOT NULL,
    "Function" text,
    "Description" text,
    "InitIdentifier" text,
    "CreatedAt" timestamp without time zone NOT NULL,
    "UpdatedAt" timestamp without time zone NOT NULL,
    "Status" integer NOT NULL,
    "LockHolder" text,
    "Request" bytea,
    "ExecutionTime" timestamp without time zone,
    "LockedAt" timestamp without time zone,
    "ExecutedAt" timestamp without time zone,
    "ExceptionMessage" text,
    "SkippedReason" text,
    "ElapsedTime" bigint NOT NULL,
    "Retries" integer NOT NULL,
    "RetryCount" integer NOT NULL,
    "RetryIntervals" integer[],
    "ParentId" uuid,
    "RunCondition" integer,
    CONSTRAINT "PK_TimeTickers" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_TimeTickers_TimeTickers_ParentId" FOREIGN KEY ("ParentId") REFERENCES plantour."TimeTickers" ("Id")
);


CREATE TABLE IF NOT EXISTS plantour."CronTickerOccurrences" (
    "Id" uuid NOT NULL,
    "Status" integer NOT NULL,
    "LockHolder" text,
    "ExecutionTime" timestamp without time zone NOT NULL,
    "CronTickerId" uuid NOT NULL,
    "LockedAt" timestamp without time zone,
    "ExecutedAt" timestamp without time zone,
    "ExceptionMessage" text,
    "SkippedReason" text,
    "ElapsedTime" bigint NOT NULL,
    "RetryCount" integer NOT NULL,
    "CreatedAt" timestamp without time zone NOT NULL,
    "UpdatedAt" timestamp without time zone NOT NULL,
    CONSTRAINT "PK_CronTickerOccurrences" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_CronTickerOccurrences_CronTickers_CronTickerId" FOREIGN KEY ("CronTickerId") REFERENCES plantour."CronTickers" ("Id") ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS "IX_CronTickerOccurrence_CronTickerId" ON plantour."CronTickerOccurrences" ("CronTickerId");


CREATE INDEX IF NOT EXISTS "IX_CronTickerOccurrence_ExecutionTime" ON plantour."CronTickerOccurrences" ("ExecutionTime");


CREATE INDEX IF NOT EXISTS "IX_CronTickerOccurrence_Status_ExecutionTime" ON plantour."CronTickerOccurrences" ("Status", "ExecutionTime");


CREATE UNIQUE INDEX IF NOT EXISTS "UQ_CronTickerId_ExecutionTime" ON plantour."CronTickerOccurrences" ("CronTickerId", "ExecutionTime");


CREATE INDEX IF NOT EXISTS "IX_CronTickers_Expression" ON plantour."CronTickers" ("Expression");


CREATE INDEX IF NOT EXISTS "IX_Function_Expression" ON plantour."CronTickers" ("Function", "Expression");


CREATE INDEX IF NOT EXISTS "IX_TimeTicker_ExecutionTime" ON plantour."TimeTickers" ("ExecutionTime");


CREATE INDEX IF NOT EXISTS "IX_TimeTicker_Status_ExecutionTime" ON plantour."TimeTickers" ("Status", "ExecutionTime");


CREATE INDEX IF NOT EXISTS "IX_TimeTickers_ParentId" ON plantour."TimeTickers" ("ParentId");



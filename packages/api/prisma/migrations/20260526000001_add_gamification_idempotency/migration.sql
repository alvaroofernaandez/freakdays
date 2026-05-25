-- CreateTable
CREATE TABLE "EventHandlerLog" (
    "eventId" TEXT NOT NULL,
    "handler" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventHandlerLog_pkey" PRIMARY KEY ("eventId","handler")
);

-- CreateIndex
CREATE INDEX "EventHandlerLog_handler_processedAt_idx" ON "EventHandlerLog"("handler", "processedAt");

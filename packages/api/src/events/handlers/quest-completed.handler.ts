import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { computeLevel } from '@freakdays/domain';

import { PrismaService } from '../../common/prisma/prisma.service';
import type { DomainEvent, QuestCompletedPayload } from '../event.types';

@Injectable()
export class QuestCompletedHandler {
  private readonly logger = new Logger(QuestCompletedHandler.name);

  constructor(private readonly _prisma: PrismaService) {}

  async handle(
    event: DomainEvent<QuestCompletedPayload>,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const { userId, expAwarded } = event.payload;

    const profile = await tx.profile.findUnique({
      where: { userId },
      select: { id: true, totalExp: true, level: true },
    });

    if (!profile) {
      this.logger.warn(`QuestCompletedHandler: profile not found for userId=${userId}`);
      return;
    }

    const newLevel = computeLevel(profile.totalExp + expAwarded);

    await tx.profile.update({
      where: { id: profile.id },
      data: { level: newLevel },
    });

    await tx.processedEvent.create({
      data: {
        eventId: event.eventId,
        type: event.type,
      },
    });

    this.logger.log(
      `QuestCompletedHandler: reconciled level for userId=${userId} → level=${newLevel}`,
    );
  }
}

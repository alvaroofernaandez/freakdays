import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaService } from './common/prisma/prisma.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const isDev = process.env.NODE_ENV !== 'prod';

  app.use(
    helmet({
      contentSecurityPolicy: isDev ? false : undefined,
      crossOriginEmbedderPolicy: false,
    }),
  );

  const rawOrigins = process.env.CORS_ORIGINS;
  const origin: string | string[] =
    rawOrigins && rawOrigins.trim().length > 0
      ? rawOrigins.split(',').map((o) => o.trim())
      : isDev
        ? '*'
        : [];

  app.enableCors({ origin });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  Logger.log(`FreakDays API listening on port ${port}`, 'Bootstrap');
}

void bootstrap();

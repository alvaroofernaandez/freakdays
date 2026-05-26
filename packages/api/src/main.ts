import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { PrismaService } from './common/prisma/prisma.service';
import { RedisIoAdapter } from './realtime/redis-io.adapter';

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

  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api');

  const enableDocs = process.env.NODE_ENV !== 'prod' || process.env.ENABLE_API_DOCS === 'true';

  if (enableDocs) {
    const config = new DocumentBuilder()
      .setTitle('FreakDays API')
      .setDescription('Backend API for FreakDays')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  app.useWebSocketAdapter(new RedisIoAdapter(app));

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`FreakDays API listening on port ${port}`, 'Bootstrap');
}

void bootstrap();

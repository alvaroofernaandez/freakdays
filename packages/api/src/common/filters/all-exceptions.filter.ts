import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(@Optional() @Inject(Logger) private readonly logger: Logger | null) {}

  private log(level: 'warn' | 'error', message: string, context?: string): void {
    if (this.logger) {
      if (level === 'warn') this.logger.warn(message, context);
      else this.logger.error(message, context);
    }
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const requestId = request.requestId ?? 'unknown';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      this.log('warn', `[${requestId}] HttpException ${status}: ${exception.message}`);
      response.status(status).json(body);
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        this.log('warn', `[${requestId}] Prisma P2002 unique constraint: ${exception.message}`);
        response.status(HttpStatus.CONFLICT).json({ message: 'Recurso duplicado' });
        return;
      }

      if (exception.code === 'P2025') {
        this.log('warn', `[${requestId}] Prisma P2025 not found: ${exception.message}`);
        response.status(HttpStatus.NOT_FOUND).json({ message: 'Recurso no encontrado' });
        return;
      }
    }

    this.log(
      'error',
      `[${requestId}] Unhandled exception: ${exception instanceof Error ? exception.stack : String(exception)}`,
    );
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Error interno del servidor' });
  }
}

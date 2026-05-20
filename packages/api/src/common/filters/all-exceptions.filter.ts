import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const requestId = request.requestId ?? 'unknown';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      this.logger.warn(`[${requestId}] HttpException ${status}`, exception.message);
      response.status(status).json(body);
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        this.logger.warn(`[${requestId}] Prisma P2002 unique constraint`, exception.message);
        response.status(HttpStatus.CONFLICT).json({ message: 'Recurso duplicado' });
        return;
      }

      if (exception.code === 'P2025') {
        this.logger.warn(`[${requestId}] Prisma P2025 not found`, exception.message);
        response.status(HttpStatus.NOT_FOUND).json({ message: 'Recurso no encontrado' });
        return;
      }
    }

    this.logger.error(
      `[${requestId}] Unhandled exception`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Error interno del servidor' });
  }
}

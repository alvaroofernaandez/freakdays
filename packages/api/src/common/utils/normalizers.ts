import { BadRequestException } from '@nestjs/common';

type NumberInput = number | string | null | undefined;
type DateInput = string | Date | null | undefined;

export function normalizeInteger(value: NumberInput, field: string, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = typeof value === 'string' ? Number(value) : value;

  if (typeof parsed !== 'number' || Number.isNaN(parsed)) {
    throw new BadRequestException(`El campo ${field} debe ser numérico`);
  }

  if (parsed < 0) {
    throw new BadRequestException(`El campo ${field} no puede ser negativo`);
  }

  return Math.floor(parsed);
}

export function normalizeOptionalInteger(value: NumberInput, field: string): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return normalizeInteger(value, field, 0);
}

export function normalizeOptionalText(value?: string | null): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function normalizeOptionalDate(value: DateInput, field: string): Date | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value as string);

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`El campo ${field} tiene un formato inválido`);
  }

  return parsed;
}

export function normalizeUrl(value: string, field: string): string {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new BadRequestException(`${field} debe ser una URL válida`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestException(`${field} solo acepta URLs con protocolo http o https`);
  }

  return value;
}

export function normalizeTitle(value: string, maxLength = 180): string {
  const title = typeof value === 'string' ? value.trim() : '';

  if (title.length === 0) {
    throw new BadRequestException('El título es obligatorio');
  }

  if (title.length > maxLength) {
    throw new BadRequestException(`El título no puede superar ${maxLength} caracteres`);
  }

  return title;
}

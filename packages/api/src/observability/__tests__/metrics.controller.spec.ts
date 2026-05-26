import { Test, type TestingModule } from '@nestjs/testing';

import { MetricsController } from '../metrics.controller';
import { MetricsService } from '../metrics.service';

const PROMETHEUS_TEXT =
  '# HELP domain_event_processing_total Total events\n' +
  '# TYPE domain_event_processing_total counter\n' +
  'domain_event_processing_total 0\n' +
  '# HELP domain_event_processing_duration_ms Duration\n' +
  '# TYPE domain_event_processing_duration_ms histogram\n' +
  'domain_event_processing_duration_ms_count 0\n' +
  '# HELP outbox_backlog Backlog\n' +
  '# TYPE outbox_backlog gauge\n' +
  'outbox_backlog 0\n';

const CONTENT_TYPE = 'text/plain; version=0.0.4; charset=utf-8';

describe('MetricsController', () => {
  let controller: MetricsController;
  let mockMetricsService: { metrics: jest.Mock; contentType: string };

  beforeEach(async () => {
    mockMetricsService = {
      metrics: jest.fn().mockResolvedValue(PROMETHEUS_TEXT),
      contentType: CONTENT_TYPE,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    controller = module.get(MetricsController);
  });

  it('delegates to metricsService.metrics()', async () => {
    const mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.getMetrics(mockRes as never);

    expect(mockMetricsService.metrics).toHaveBeenCalledTimes(1);
  });

  it('sets Content-Type to prometheus text format', async () => {
    const mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.getMetrics(mockRes as never);

    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', CONTENT_TYPE);
  });

  it('sends status 200 with prometheus text body', async () => {
    const mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.getMetrics(mockRes as never);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith(PROMETHEUS_TEXT);
  });

  it('body returned by metrics() contains all three metric names', async () => {
    mockMetricsService.metrics.mockResolvedValueOnce(PROMETHEUS_TEXT);

    const capturedBody: string[] = [];
    const mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockImplementation((body: string) => capturedBody.push(body)),
    };

    await controller.getMetrics(mockRes as never);

    const body = capturedBody[0] ?? '';
    expect(body).toContain('domain_event_processing_total');
    expect(body).toContain('domain_event_processing_duration_ms');
    expect(body).toContain('outbox_backlog');
  });
});

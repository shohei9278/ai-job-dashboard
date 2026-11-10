import { Controller, Get, Header, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AllExceptionsFilter } from './all-exceptions.filter';

const CACHED = 'public, max-age=86400';

@Controller()
class CachedController {
  @Header('Cache-Control', CACHED)
  @Get('ok')
  ok() {
    return { ok: true };
  }

  @Header('Cache-Control', CACHED)
  @Get('broken')
  broken() {
    throw new Error('database is down');
  }
}

describe('AllExceptionsFilter', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CachedController],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(() => app.close());

  it('エラーの応答はキャッシュさせない', async () => {
    const response = await request(app.getHttpServer()).get('/broken');
    expect(response.status).toBe(500);
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('成功の応答はルートのキャッシュ指定のまま', async () => {
    const response = await request(app.getHttpServer()).get('/ok');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe(CACHED);
  });
});

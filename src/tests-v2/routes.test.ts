import request from 'sync-request-curl';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

describe('GET /', () => {
  it('should redirect to /docs', async () => {
    const res = request('GET', `${SERVER_URL}/`);
    expect(res.statusCode).toBe(200);
    expect(res.headers.location).toBe('/docs/');
  });
});

describe('GET /docs', () => {
  it('should serve the Swagger UI', async () => {
    const res = request('GET', `${SERVER_URL}/docs`);
    const body = res.getBody('utf8');
    expect(res.statusCode).toBe(200);
    // Check if the HTML contains a specific class or attribute indicating 'full' expansion
    expect(body).not.toContain('full');
  });
});

describe('Failing test for /non-existent-route', () => {
  test('Testing for a non-existent route', () => {
    const res = request('POST', `${SERVER_URL}/v1/player/join/join`);
    expect(res.statusCode).toBe(200);
  });
});

const request = require('supertest');
const app = require('../src/app');

describe('API', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /api/calculate returns result', async () => {
    const res = await request(app)
      .post('/api/calculate')
      .send({ a: 6, b: 3, operation: 'divide' });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(2);
  });

  test('POST /api/calculate returns 400 on error', async () => {
    const res = await request(app)
      .post('/api/calculate')
      .send({ a: 6, b: 0, operation: 'divide' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Cannot divide by zero');
  });

  test('GET / serves the web page', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('DevOps Calculator');
  });
});
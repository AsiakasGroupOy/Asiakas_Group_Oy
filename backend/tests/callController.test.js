const request = require('supertest');
const app = require('../index'); // Adjust if necessary

describe('Call Controller', () => {
  it('should fetch all calls', async () => {
    const res = await request(app).get('/api/calls');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should create a new call', async () => {
    const res = await request(app)
      .post('/api/calls')
      .send({ name: 'Test Call', status: 'pending' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toBe('Test Call');
  });
});

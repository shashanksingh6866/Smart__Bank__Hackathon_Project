const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints', () => {
    it('should return welcome message', async () => {
        const res = await request(app)
            .get('/')
            .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message');
    });

    // Basic validation test (no DB required if we mock or just check 400)
    it('should fail registration with missing fields', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                email: 'test@example.com'
                // Missing password
            });
        expect(res.statusCode).toEqual(400);
    });
});

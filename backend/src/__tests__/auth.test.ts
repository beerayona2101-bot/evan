import request from 'supertest';
import app from '../app';
import { User } from '../models/User';

describe('Auth Endpoints & Service', () => {
  it('should successfully register a new customer', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Kavita Patel',
        email: 'kavita.patel@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('email', 'kavita.patel@example.com');
    expect(res.body.role).toBe('customer');

    const dbUser = await User.findOne({ email: 'kavita.patel@example.com' });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.password).not.toBe('Password123!');
  });

  it('should prevent registration with existing email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sunita Reddy',
        email: 'sunita.dup@example.com',
        password: 'Password123!',
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sunita Duplicate',
        email: 'sunita.dup@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered|already exists/i);
  });

  it('should authenticate user and return token on valid login', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        password: 'SecurePass123!',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rajesh.kumar@example.com',
        password: 'SecurePass123!',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('rajesh.kumar@example.com');
  });

  it('should reject login with wrong credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Priya Verma',
        email: 'priya.verma@example.com',
        password: 'CorrectPassword123!',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'priya.verma@example.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('should return health check endpoint status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

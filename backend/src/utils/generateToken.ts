import jwt from 'jsonwebtoken';

export const generateToken = (id: string, role: string = 'customer'): string => {
  const secret = process.env.JWT_SECRET || 'evan_luxury_men_fashion_jwt_secret_key_2026';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '30d',
  });
};

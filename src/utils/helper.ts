// utils/authUtils.ts
import { config } from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { Token } from "../database/models/Token";

config();

export const secretKey = process.env.JWT_SECRET || "SecretKey";

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = async ({ id, email, role }: { id: string; email: string; role: string }): Promise<string> => {
  const jti = uuidv4();
  const payload = { id, email, role, jti };
  const token = jwt.sign(payload, secretKey, { expiresIn: '12h' });

  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);

  await Token.create({
    jti,
    token,
    userId: id,
    blacklisted: false,
    expiresAt,
  });

  return token;
};

export const verifyToken = async (token: string): Promise<any> => {
  try {
    const decoded = jwt.verify(token, secretKey) as any;

    const dbToken = await Token.findOne({ where: { jti: decoded.jti } });

    if (!dbToken || dbToken.blacklisted) {
      throw new Error('Token invalid or blacklisted');
    }

    if (dbToken.expiresAt < new Date()) {
      throw new Error('Token has expired');
    }

    return decoded;
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    throw new Error('Unauthorized');
  }
};

export const destroyToken = async (token: string): Promise<void> => {
  try {
    const decoded = jwt.verify(token, secretKey) as any;
    await Token.update({ blacklisted: true }, { where: { jti: decoded.jti } });
  } catch (error: any) {
    console.error('Error destroying token:', error.message);
  }
};

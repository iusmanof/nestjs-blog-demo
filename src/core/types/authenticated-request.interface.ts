import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: { id: string; login: string; [key: string]: any }; // можешь добавить email, roles и т.д.
}

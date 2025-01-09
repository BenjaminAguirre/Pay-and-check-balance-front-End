import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const generateUniqueId = () => {
  const id = uuidv4(); // Genera un UUID
  const hash = crypto.createHash('sha256').update(id).digest('hex'); // Crea un hash SHA-256
  return hash;
};
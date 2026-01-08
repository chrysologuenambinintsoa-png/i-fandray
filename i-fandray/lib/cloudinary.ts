import crypto from 'crypto';

export const CLOUDINARY = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
};

export function signCloudinaryParams(params: Record<string, any>, apiSecret: string) {
  const keys = Object.keys(params).filter((k) => params[k] !== undefined && params[k] !== null);
  keys.sort();
  const toSign = keys.map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}

import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || '3001',
  mongoConnection: process.env.MONGOCONNECTION || 'mongodb://127.0.0.1:27017/hospital-management-system',
  secretKey: process.env.SECRET_KEY || 'my_secret_key',
};

process.env.SECRET_KEY = env.secretKey;

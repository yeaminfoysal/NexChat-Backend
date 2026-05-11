import { registerAs } from '@nestjs/config';

export const envConfig = registerAs('env', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'access_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  throttleTtl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT ?? '10', 10),
}));

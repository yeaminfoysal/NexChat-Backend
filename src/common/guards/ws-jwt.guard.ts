import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.headers?.authorization?.replace('Bearer ', '') ?? '');

    if (!token) {
      throw new WsException('Unauthorized: No token provided');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      client.data.userId = payload.sub as string;
      client.data.email = payload.email as string;
      return true;
    } catch {
      throw new WsException('Unauthorized: Invalid token');
    }
  }
}

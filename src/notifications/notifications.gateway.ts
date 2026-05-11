import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseFilters, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { WsExceptionFilter } from '../common/filters/ws-exception.filter';

@WebSocketGateway({ cors: { origin: '*' } })
@UseGuards(WsJwtGuard)
@UseFilters(WsExceptionFilter)
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  emitNotification(userId: string, notification: Record<string, unknown>) {
    this.server.to(`user:${userId}`).emit('notification_received', notification);
  }

  emitUnreadCount(userId: string, conversationId: string, unreadCount: number) {
    this.server
      .to(`user:${userId}`)
      .emit('unread_count_updated', { conversationId, unreadCount });
  }
}

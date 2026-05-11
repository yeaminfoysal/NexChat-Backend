import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketStateService {
  // Map<userId, Set<socketId>>
  private readonly userSockets = new Map<string, Set<string>>();

  addSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  removeSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  getSocketIds(userId: string): string[] {
    return Array.from(this.userSockets.get(userId) ?? []);
  }

  isOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return !!sockets && sockets.size > 0;
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }
}

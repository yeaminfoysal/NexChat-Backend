import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const FRIEND_USER_SELECT = {
  id: true,
  name: true,
  username: true,
  avatar: true,
  isOnline: true,
  lastSeen: true,
};

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
      select: FRIEND_USER_SELECT,
    });
    if (!receiver) throw new NotFoundException('User not found');

    // Check block
    const block = await this.prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockedById: senderId, blockedUserId: receiverId },
          { blockedById: receiverId, blockedUserId: senderId },
        ],
      },
    });
    if (block) throw new ForbiddenException('Cannot send friend request');

    // Check already friends
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId },
        ],
      },
    });
    if (friendship) throw new ConflictException('Already friends');

    // Check existing request
    const existing = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
        status: 'PENDING',
      },
    });
    if (existing) throw new ConflictException('Friend request already exists');

    const request = await this.prisma.friendRequest.create({
      data: { senderId, receiverId, status: 'PENDING' },
      include: {
        sender: { select: FRIEND_USER_SELECT },
        receiver: { select: FRIEND_USER_SELECT },
      },
    });

    return request;
  }

  async acceptRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: { sender: { select: FRIEND_USER_SELECT } },
    });

    if (!request) throw new NotFoundException('Friend request not found');
    if (request.receiverId !== userId) throw new ForbiddenException('Not authorized');
    if (request.status !== 'PENDING') throw new BadRequestException('Request is not pending');

    const [updatedRequest, friendship] = await this.prisma.$transaction([
      this.prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      }),
      this.prisma.friendship.create({
        data: { user1Id: request.senderId, user2Id: userId },
      }),
    ]);

    return { request: updatedRequest, friendship, sender: request.sender };
  }

  async rejectRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Friend request not found');
    if (request.receiverId !== userId) throw new ForbiddenException('Not authorized');

    return this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
  }

  async cancelRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Friend request not found');
    if (request.senderId !== userId) throw new ForbiddenException('Not authorized');

    return this.prisma.friendRequest.delete({ where: { id: requestId } });
  }

  async removeFriend(friendshipId: string, userId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship) throw new NotFoundException('Friendship not found');
    if (friendship.user1Id !== userId && friendship.user2Id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    await this.prisma.friendship.delete({ where: { id: friendshipId } });
    return { message: 'Friend removed' };
  }

  async blockUser(blockerId: string, targetId: string) {
    if (blockerId === targetId) throw new BadRequestException('Cannot block yourself');

    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('User not found');

    const existing = await this.prisma.blockedUser.findUnique({
      where: { blockedById_blockedUserId: { blockedById: blockerId, blockedUserId: targetId } },
    });
    if (existing) throw new ConflictException('User already blocked');

    // Remove friendship if exists
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { user1Id: blockerId, user2Id: targetId },
          { user1Id: targetId, user2Id: blockerId },
        ],
      },
    });

    // Cancel any pending friend requests
    await this.prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: blockerId, receiverId: targetId },
          { senderId: targetId, receiverId: blockerId },
        ],
        status: 'PENDING',
      },
    });

    return this.prisma.blockedUser.create({
      data: { blockedById: blockerId, blockedUserId: targetId },
    });
  }

  async unblockUser(blockerId: string, targetId: string) {
    const block = await this.prisma.blockedUser.findUnique({
      where: { blockedById_blockedUserId: { blockedById: blockerId, blockedUserId: targetId } },
    });
    if (!block) throw new NotFoundException('Block not found');

    return this.prisma.blockedUser.delete({
      where: { blockedById_blockedUserId: { blockedById: blockerId, blockedUserId: targetId } },
    });
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: FRIEND_USER_SELECT },
        user2: { select: FRIEND_USER_SELECT },
      },
    });

    return friendships.map((f) => ({
      friendshipId: f.id,
      friend: f.user1Id === userId ? f.user2 : f.user1,
      since: f.createdAt,
    }));
  }

  async getPendingRequests(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: { sender: { select: FRIEND_USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSentRequests(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: { senderId: userId, status: 'PENDING' },
      include: { receiver: { select: FRIEND_USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

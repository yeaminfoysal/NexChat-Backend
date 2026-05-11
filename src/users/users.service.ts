import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { buildOffsetPagination } from '../common/utils/pagination.util';

const USER_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
  avatar: true,
  bio: true,
  isOnline: true,
  lastSeen: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatar && { avatar: dto.avatar }),
      },
      select: USER_SELECT,
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async searchUsers(dto: SearchUserDto, requesterId: string) {
    const { take, skip } = buildOffsetPagination(dto.page, dto.limit);

    // Get users blocked by or blocking the requester
    const blocks = await this.prisma.blockedUser.findMany({
      where: {
        OR: [{ blockedById: requesterId }, { blockedUserId: requesterId }],
      },
      select: { blockedById: true, blockedUserId: true },
    });

    const blockedIds = new Set<string>();
    for (const b of blocks) {
      blockedIds.add(b.blockedById);
      blockedIds.add(b.blockedUserId);
    }
    blockedIds.delete(requesterId);

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: requesterId } },
          { id: { notIn: Array.from(blockedIds) } },
          {
            OR: [
              { name: { contains: dto.query, mode: 'insensitive' } },
              { username: { contains: dto.query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: USER_SELECT,
      take,
      skip,
    });

    return users;
  }

  async setOnlineStatus(userId: string, isOnline: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: isOnline ? undefined : new Date(),
      },
    });
  }
}

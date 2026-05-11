import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendFriendRequestDto {
  @ApiProperty({ example: 'user-uuid-here' })
  @IsString()
  @IsNotEmpty()
  receiverId: string;
}

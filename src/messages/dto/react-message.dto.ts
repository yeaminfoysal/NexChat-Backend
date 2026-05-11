import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReactMessageDto {
  @ApiProperty({ example: 'msg-uuid' })
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({ example: '❤️' })
  @IsString()
  @IsNotEmpty()
  emoji: string;
}

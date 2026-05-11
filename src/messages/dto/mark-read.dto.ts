import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiProperty({ example: 'conv-uuid' })
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({ example: 'msg-uuid' })
  @IsString()
  @IsNotEmpty()
  messageId: string;
}

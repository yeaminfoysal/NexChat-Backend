import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../../common/enums/message-type.enum';

export class SendMessageDto {
  @ApiProperty({ example: 'conv-uuid' })
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @ApiPropertyOptional({ example: 'Hello world' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ enum: MessageType, example: MessageType.TEXT })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiPropertyOptional({ example: 'https://cloudinary.com/...' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ example: 204800 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  mediaSize?: number;

  @ApiPropertyOptional({ example: 'image/jpeg' })
  @IsOptional()
  @IsString()
  mediaType?: string;

  @ApiPropertyOptional({ example: 'reply-msg-uuid' })
  @IsOptional()
  @IsString()
  replyToId?: string;
}

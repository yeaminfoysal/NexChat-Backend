import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditMessageDto {
  @ApiProperty({ example: 'msg-uuid' })
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({ example: 'Updated message text' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

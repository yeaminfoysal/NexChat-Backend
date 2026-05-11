import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDirectDto {
  @ApiProperty({ example: 'user-uuid-here' })
  @IsString()
  @IsNotEmpty()
  targetUserId: string;
}

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondRequestDto {
  @ApiProperty({ example: 'request-uuid-here' })
  @IsString()
  @IsNotEmpty()
  requestId: string;
}

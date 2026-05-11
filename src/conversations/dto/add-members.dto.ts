import { IsArray, ArrayMinSize, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMembersDto {
  @ApiProperty({ example: ['user-1-uuid', 'user-2-uuid'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  memberIds: string[];
}

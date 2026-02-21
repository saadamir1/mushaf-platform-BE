import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'Profile picture URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'Admin@123',
    description: 'Current password',
  })
  @IsString({ message: 'Current password must be a string' })
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description: 'New password (min 8 characters)',
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string;
}
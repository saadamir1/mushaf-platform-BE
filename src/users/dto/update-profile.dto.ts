import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
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
    example: 'OldPassword123',
    description: 'Current password',
  })
  @IsString({ message: 'Current password must be a string' })
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'New password (min 8 chars, must contain uppercase, lowercase, and number)',
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}

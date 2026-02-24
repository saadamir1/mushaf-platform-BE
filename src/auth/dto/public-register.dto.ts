import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublicRegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'User password (min 8 characters, must contain uppercase, lowercase, and number)',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Wick', description: 'User last name' })
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  lastName: string;
}

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublicRegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (min 4 characters)',
  })
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
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

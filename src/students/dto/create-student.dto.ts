import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional, IsMongoId } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsMongoId()
  batchId: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}

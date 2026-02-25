import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginStudentDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

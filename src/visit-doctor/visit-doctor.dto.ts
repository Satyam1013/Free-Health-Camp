import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateVisitDoctorDto {
  @IsString()
  @IsNotEmpty()
  username: string

  @IsString()
  @IsNotEmpty()
  mobile: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsString()
  @IsNotEmpty()
  password: string
}

export class UpdateVisitDoctorDto {
  @IsOptional()
  @IsString()
  username?: string

  @IsOptional()
  @IsString()
  mobile?: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsOptional()
  @IsString()
  password?: string
}

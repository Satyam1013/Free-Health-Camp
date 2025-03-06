import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class BookDoctorDto {
  @IsString()
  @IsNotEmpty()
  patientName: string

  @IsString()
  @IsNotEmpty()
  mobile: string

  @IsString()
  @IsNotEmpty()
  symptoms: string
}

export class UpdatePatientStatusDto {
  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  nextVisitDate?: string
}

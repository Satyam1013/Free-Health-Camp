import { PartialType } from '@nestjs/mapped-types'

export class CreateVisitDoctorDto {
  readonly name: string
  readonly specialization: string
  readonly experience: number
  readonly hospital: string
  readonly contact: string
}

export class UpdateVisitDoctorDto extends PartialType(CreateVisitDoctorDto) {}

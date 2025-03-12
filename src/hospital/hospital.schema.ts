import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { BaseModel } from 'src/common/common.schema'
import { Doctor, DoctorSchema, Staff, StaffSchema } from 'src/common/doctor-staff.schema'

export type HospitalDocument = Hospital & Document

@Schema()
export class Hospital extends BaseModel {
  @Prop({ required: true, default: UserRole.HOSPITAL })
  role: UserRole

  @Prop({ required: true })
  workId: string

  @Prop({ type: [DoctorSchema], default: [] })
  doctors: Doctor[]

  @Prop({ type: [StaffSchema], default: [] })
  staff: Staff[]

  @Prop({ type: [String], default: [] })
  availableServices: string[]
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital)

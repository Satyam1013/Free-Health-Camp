import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Doctor, DoctorSchema, Staff, StaffSchema } from 'src/common/doctor-staff.schema'

export type HospitalDocument = Hospital & Document

@Schema()
export class Hospital {
  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true })
  password: string

  @Prop({ type: String, required: true })
  hospitalName: string

  @Prop({ required: true })
  city: string

  @Prop()
  address: string

  @Prop({ required: true, default: 'Hospital' })
  role: string

  @Prop({ type: [DoctorSchema], default: [] })
  doctors: Doctor[]

  @Prop({ type: [StaffSchema], default: [] })
  staff: Staff[]

  @Prop({ type: [String], default: [] })
  availableServices: string[]
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital)

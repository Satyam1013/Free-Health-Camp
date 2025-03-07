import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Staff, StaffSchema } from 'src/common/doctor-staff.schema'

export type LabDocument = Lab & Document

@Schema()
export class Lab {
  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true })
  password: string

  @Prop({ type: String, required: true })
  labName: string

  @Prop({ required: true })
  city: string

  @Prop({ type: String })
  address: string

  @Prop({ required: true, default: 'Lab' })
  role: string

  @Prop({ type: [StaffSchema], default: [] })
  staff: Staff[]

  @Prop({ type: [String], default: [] })
  availableTests: string[]
}

export const LabSchema = SchemaFactory.createForClass(Lab)

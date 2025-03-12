import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { BaseModel } from 'src/common/common.schema'
import { Staff, StaffSchema } from 'src/common/doctor-staff.schema'

export type LabDocument = Lab & Document

@Schema()
export class Lab extends BaseModel {
  @Prop({ required: true, default: UserRole.LAB })
  role: UserRole

  @Prop({ required: true })
  workId: string

  @Prop({ type: [StaffSchema], default: [] })
  staff: Staff[]

  @Prop({ type: [String], default: [] })
  availableTests: string[]
}

export const LabSchema = SchemaFactory.createForClass(Lab)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { AvailableService, AvailableServiceSchema, BaseModel } from 'src/common/common.schema'
import { Doctor, DoctorSchema, Staff, StaffSchema } from '../common/common.schema'

export type HospitalDocument = Hospital & Document

@Schema()
export class Hospital extends BaseModel {
  @Prop({ required: true, default: UserRole.HOSPITAL })
  role: UserRole

  @Prop({ required: true, unique: true })
  workId: string

  @Prop({ type: [DoctorSchema], default: [] })
  doctors: Doctor[]

  @Prop({ type: [StaffSchema], default: [] })
  staff: Staff[]

  @Prop({ type: [AvailableServiceSchema], default: [] })
  availableServices: AvailableService[]

  @Prop()
  startTime?: string

  @Prop()
  endTime?: string
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { AvailableService, AvailableServiceSchema, BaseModel } from 'src/common/common.schema'
import { Staff, StaffSchema } from '../common/common.schema'

export type LabDocument = Lab & Document

@Schema()
export class Lab extends BaseModel {
  @Prop({ required: true, default: UserRole.LAB })
  role: UserRole

  @Prop({ required: true, unique: true })
  workId: string

  @Prop({ type: [StaffSchema], default: [] })
  staff: Staff[]

  @Prop({ type: [AvailableServiceSchema], default: [] })
  availableServices: AvailableService[]

  @Prop()
  startTime?: string

  @Prop()
  endTime?: string
}

export const LabSchema = SchemaFactory.createForClass(Lab)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { UserRole } from 'src/common/common.types'
import { AvailableService, AvailableServiceSchema, BaseModel } from 'src/common/common.schema'
import { Staff, StaffSchema } from '../common/common.schema'

export type LabDocument = Lab & Document

@Schema()
export class Lab extends BaseModel {
  @Prop({ required: true, default: UserRole.LAB })
  role: UserRole

  @Prop({ required: true })
  workId: string

  @Prop({ type: [StaffSchema], default: [] })
  staff: Staff[]

  @Prop({ default: 0 })
  adminRevenue: number

  @Prop({ default: 0 })
  feeBalance: number

  @Prop({ type: [AvailableServiceSchema], default: [] })
  availableServices: AvailableService[]

  @Prop({ default: '09:00' }) // 9 AM
  shiftOneStartTime?: string

  @Prop({ default: '21:00' }) // 9 PM
  shiftOneEndTime?: string

  @Prop()
  shiftTwoStartTime?: string

  @Prop()
  shiftTwoEndTime?: string
}

export const LabSchema = SchemaFactory.createForClass(Lab)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'
import { BaseModel, Staff } from 'src/common/common.schema'
import { PaidStatus, UserRole } from 'src/common/common.types'

export const StaffSchema = SchemaFactory.createForClass(Staff)

@Schema()
class VisitDetails {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId

  @Prop({ required: true })
  visitName: string

  @Prop({ required: true })
  visitPlace: string

  @Prop({ required: true })
  city: string

  @Prop({ required: true })
  doctorFee: number

  @Prop({ required: true })
  eventDate: Date

  @Prop({ type: Date, required: true })
  startTime: Date

  @Prop({ type: Date, required: true })
  endTime: Date

  @Prop({ type: [StaffSchema], default: [] })
  staff: Staff[]
}

const VisitSchema = SchemaFactory.createForClass(VisitDetails)

export type VisitDoctorDocument = VisitDoctor & Document

@Schema()
export class VisitDoctor extends BaseModel {
  @Prop({ required: true, default: UserRole.VISIT_DOCTOR })
  role: UserRole

  @Prop({ required: true })
  workId: string

  @Prop({ default: 0 })
  adminRevenue: number

  @Prop({ default: 0 })
  feeBalance: number

  @Prop({ type: String, enum: PaidStatus, default: PaidStatus.PENDING })
  paidStatus: PaidStatus

  @Prop({ type: Boolean, default: false })
  serviceStop: boolean

  @Prop({ type: [VisitSchema], default: [] })
  visitDetails: VisitDetails[]
}

export const VisitDoctorSchema = SchemaFactory.createForClass(VisitDoctor)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { PaidStatus, UserRole } from 'src/common/common.types'
import { AvailableService, AvailableServiceSchema, BaseModel } from 'src/common/common.schema'
import { Doctor, Staff, StaffSchema } from '../common/common.schema'
import { Types } from 'mongoose'

@Schema()
export class HospitalDoctor extends Doctor {
  @Prop({ required: true })
  service: string

  @Prop({ type: Types.ObjectId, ref: 'AvailableService', required: true })
  serviceId: Types.ObjectId
}

export const HospitalDoctorSchema = SchemaFactory.createForClass(HospitalDoctor)

export type HospitalDocument = Hospital & Document

@Schema()
export class Hospital extends BaseModel {
  @Prop({ required: true, default: UserRole.HOSPITAL })
  role: UserRole

  @Prop({ required: true })
  workId: string

  @Prop({ type: [HospitalDoctorSchema], default: [] })
  doctors: HospitalDoctor[]

  @Prop({ type: [StaffSchema], default: [] })
  staff: Staff[]

  @Prop({ type: [AvailableServiceSchema], default: [] })
  availableServices: AvailableService[]

  @Prop({ default: 0 })
  adminRevenue: number

  @Prop({ default: 0 })
  feeBalance: number

  @Prop({ type: String, enum: PaidStatus, default: PaidStatus.PENDING })
  paidStatus: PaidStatus

  @Prop([
    {
      adminRevenue: { type: Number, default: 0 },
      pendingRevenue: { type: Number, default: 0 },
      startDate: { type: Date, required: true },
    },
  ])
  weeklyData: { adminRevenue: number; pendingRevenue: number; startDate: Date }

  @Prop({ type: Boolean, default: false })
  serviceStop: boolean

  @Prop({ default: '09:00' }) // 9 AM
  shiftOneStartTime?: string

  @Prop({ default: '21:00' }) // 9 PM
  shiftOneEndTime?: string

  @Prop()
  shiftTwoStartTime?: string

  @Prop()
  shiftTwoEndTime?: string
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital)

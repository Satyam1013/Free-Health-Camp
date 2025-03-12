import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { BaseModel, Gender } from 'src/common/common.schema'
import { BookingStatus } from 'src/common/doctor-staff.schema'

@Schema()
class Staff {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  address: string

  @Prop({ required: true })
  mobile: number

  @Prop({ required: true })
  password: string

  @Prop({ required: true, default: UserRole.VISIT_DOCTOR_STAFF })
  role: UserRole
}

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

  @Prop({ type: [VisitSchema], default: [] })
  visitDetails: VisitDetails[]

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, auto: true },
        name: String,
        email: String,
        mobile: Number,
        gender: String,
        age: Number,
        bookingDate: Date,
        nextVisitDate: Date,
        status: String,
      },
    ],
    default: [],
  })
  patients: Array<{
    _id: Types.ObjectId
    name: string
    email: string
    mobile: number
    age: number
    gender: Gender
    bookingDate: Date
    nextVisitDate?: Date
    status: BookingStatus
  }>
}

export const VisitDoctorSchema = SchemaFactory.createForClass(VisitDoctor)

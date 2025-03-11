import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { Gender } from 'src/common/common.schema'
import { BookingStatus } from 'src/common/doctor-staff.schema'

export type VisitDoctorDocument = VisitDoctor & Document

@Schema()
export class VisitDoctor {
  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  address: string

  @Prop({ required: true })
  city: string

  @Prop({ required: true, default: UserRole.VISIT_DOCTOR })
  role: UserRole

  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true })
  password: string

  @Prop({ type: String })
  specialization: string

  @Prop({ type: Number })
  experience: number

  @Prop({ type: String })
  clinicAddress: string

  @Prop({
    type: [{ name: String, address: String, mobile: String, pass: String }],
    default: [],
  })
  staff: Array<{ name: string; address: string; mobile: string; password: string }>

  @Prop({
    type: [
      {
        _id: Types.ObjectId,
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

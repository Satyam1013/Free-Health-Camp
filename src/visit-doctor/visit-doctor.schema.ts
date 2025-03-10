import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { BookingStatus } from 'src/common/doctor-staff.schema'

export type VisitDoctorDocument = VisitDoctor & Document

@Schema()
export class VisitDoctor {
  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  city: string

  @Prop({ required: true, default: 'VisitDoctor' })
  role: string

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
  staff: Array<{ name: string; address: string; mobile: string; pass: string }>

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, auto: true },
        name: { type: String, required: true },
        mobile: { type: Number, required: true },
        address: { type: String, required: true },
        bookingDate: { type: Date, default: Date.now },
        nextVisitDate: { type: String, required: false },
        status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.Pending },
      },
    ],
  })
  patients: Array<{
    _id: Types.ObjectId
    name: string
    mobile: number
    address: string
    bookingDate: Date
    nextVisitDate?: string
    status: BookingStatus
  }>
}

export const VisitDoctorSchema = SchemaFactory.createForClass(VisitDoctor)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { BaseModel, Gender } from 'src/common/common.schema'
import { BookingStatus } from 'src/common/doctor-staff.schema'

export type VisitDoctorDocument = VisitDoctor & Document

@Schema()
export class VisitDoctor extends BaseModel {
  @Prop({ required: true, default: UserRole.VISIT_DOCTOR })
  role: UserRole

  @Prop({ required: true })
  workId: string

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

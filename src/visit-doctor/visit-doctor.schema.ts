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
class Patient {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop()
  email: string

  @Prop({ required: true })
  mobile: number

  @Prop({ required: true })
  age: number

  @Prop({ required: true })
  gender: Gender

  @Prop({ required: true })
  bookingDate: Date

  @Prop()
  nextVisitDate?: Date

  @Prop({ required: true })
  status: BookingStatus
}

export const PatientSchema = SchemaFactory.createForClass(Patient)

@Schema()
class VisitDetails {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId

  @Prop({ required: true })
  visitName: string

  @Prop({ required: true })
  visitPlace: string

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

  @Prop({ type: [PatientSchema], default: [] })
  patients: Patient[]
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
}

export const VisitDoctorSchema = SchemaFactory.createForClass(VisitDoctor)

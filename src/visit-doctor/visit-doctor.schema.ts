import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

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
        patientId: String,
        patientName: String,
        mobile: String,
        status: String,
        bookingDate: Date,
        nextVisitDate: String,
      },
    ],
  })
  patients: Array<{
    patientId: string
    patientName: string
    mobile: string
    status: string
    bookingDate: Date
    nextVisitDate?: string
  }>
}

export const VisitDoctorSchema = SchemaFactory.createForClass(VisitDoctor)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type VisitDoctorDocument = VisitDoctor & Document

@Schema()
export class VisitDoctor {
  @Prop({ required: true })
  username: string

  @Prop()
  age: number

  @Prop()
  city: string

  @Prop()
  address: string

  @Prop({ required: true })
  role: 'VisitDoctor'

  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ type: String })
  specialization: string

  @Prop({ type: Number })
  experience: number

  @Prop({ type: String })
  clinicAddress: string

  @Prop({
    type: [
      {
        visitCampPlace: String,
        visitDate: String,
        timeFrom: String,
        timeTo: String,
        patientFee: Number,
      },
    ],
    default: [],
  })
  visitDetails: Array<{
    visitCampPlace: string
    visitDate: string
    timeFrom: string
    timeTo: string
    patientFee: number
  }>

  @Prop({
    type: [{ name: String, address: String, mobile: String, pass: String }],
    default: [],
  })
  staff: Array<{ name: string; address: string; mobile: string; pass: string }>
}

export const VisitDoctorSchema = SchemaFactory.createForClass(VisitDoctor)

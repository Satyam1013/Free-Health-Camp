import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { AvailableService, AvailableServiceSchema, BaseModel } from 'src/common/common.schema'
import { Doctor, DoctorSchema, Staff, StaffSchema } from '../common/common.schema'

@Schema()
export class HospitalDoctor extends Doctor {
  @Prop({ required: true, enum: Object.values(UserRole), default: UserRole.HOSPITAL_DOCTOR })
  role: UserRole
}

@Schema()
export class HospitalStaff extends Staff {
  @Prop({ required: true, default: UserRole.HOSPITAL_STAFF })
  role: UserRole
}

export type HospitalDocument = Hospital & Document

@Schema()
export class Hospital extends BaseModel {
  @Prop({ required: true, default: UserRole.HOSPITAL })
  role: UserRole

  @Prop({ required: true })
  workId: string

  @Prop({ type: [DoctorSchema], default: [] })
  doctors: HospitalDoctor[]

  @Prop({ type: [StaffSchema], default: [] })
  staff: HospitalStaff[]

  @Prop({ type: [AvailableServiceSchema], default: [] })
  availableServices: AvailableService[]

  @Prop()
  startTime?: string

  @Prop()
  endTime?: string
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { AvailableService, AvailableServiceSchema, BaseModel } from 'src/common/common.schema'
import { Staff, StaffSchema } from '../common/common.schema'

@Schema()
export class LabStaff extends Staff {
  @Prop({ required: true, default: UserRole.LAB_STAFF })
  role: UserRole
}

export type LabDocument = Lab & Document

@Schema()
export class Lab extends BaseModel {
  @Prop({ required: true, default: UserRole.LAB })
  role: UserRole

  @Prop({ required: true })
  workId: string

  @Prop({ type: [StaffSchema], default: [] })
  staff: LabStaff[]

  @Prop({ type: [AvailableServiceSchema], default: [] })
  availableServices: AvailableService[]
}

export const LabSchema = SchemaFactory.createForClass(Lab)

import { Prop } from '@nestjs/mongoose'

export class BaseModel {
  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true })
  username: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  address: string

  @Prop({ required: true })
  city: string
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

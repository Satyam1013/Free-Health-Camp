import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Hospital, HospitalSchema } from './hospital.schema'
import { HospitalService } from './hospital.service'
import { HospitalController } from './hospital.controller'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [MongooseModule.forFeature([{ name: Hospital.name, schema: HospitalSchema }]), forwardRef(() => AuthModule)],
  controllers: [HospitalController],
  providers: [HospitalService],
  exports: [MongooseModule, HospitalService],
})
export class HospitalModule {}

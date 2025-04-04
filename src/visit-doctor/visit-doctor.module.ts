import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { VisitDoctor, VisitDoctorSchema } from './visit-doctor.schema'
import { VisitDoctorService } from './visit-doctor.service'
import { VisitDoctorController } from './visit-doctor.controller'
import { AuthModule } from 'src/auth/auth.module'
import { PatientModule } from 'src/patient/patient.module'
import { MobileValidationModule } from 'src/mobile-validation/mobile-validation.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VisitDoctor.name, schema: VisitDoctorSchema }]),
    MobileValidationModule,
    forwardRef(() => AuthModule),
    forwardRef(() => PatientModule),
  ],
  controllers: [VisitDoctorController],
  providers: [VisitDoctorService],
  exports: [MongooseModule, VisitDoctorService],
})
export class VisitDoctorModule {}

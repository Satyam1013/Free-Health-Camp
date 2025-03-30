import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Hospital, HospitalSchema } from './hospital.schema'
import { HospitalService } from './hospital.service'
import { HospitalController } from './hospital.controller'
import { AuthModule } from 'src/auth/auth.module'
import { MobileValidationModule } from 'src/mobile-validation/mobile-validation.module'
import { PatientService } from 'src/patient/patient.service'
import { PatientModule } from 'src/patient/patient.module'
import { OrganizerModule } from 'src/organizer/organizer.module'
import { VisitDoctorModule } from 'src/visit-doctor/visit-doctor.module'
import { LabModule } from 'src/lab/lab.module'
import { CronService } from 'src/common/cron-job'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hospital.name, schema: HospitalSchema }]),
    forwardRef(() => AuthModule),
    forwardRef(() => PatientModule),
    forwardRef(() => OrganizerModule),
    forwardRef(() => VisitDoctorModule),
    forwardRef(() => LabModule),
    MobileValidationModule,
  ],
  controllers: [HospitalController],
  providers: [HospitalService, PatientService, CronService],
  exports: [MongooseModule, HospitalService],
})
export class HospitalModule {}

import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { LabController } from './lab.controller'
import { LabService } from './lab.service'
import { Lab, LabSchema } from './lab.schema'
import { AuthModule } from 'src/auth/auth.module'
import { MobileValidationModule } from 'src/mobile-validation/mobile-validation.module'
import { PatientService } from 'src/patient/patient.service'
import { PatientModule } from 'src/patient/patient.module'
import { OrganizerModule } from 'src/organizer/organizer.module'
import { VisitDoctorModule } from 'src/visit-doctor/visit-doctor.module'
import { HospitalModule } from 'src/hospital/hospital.module'
import { CronService } from 'src/common/cron-job'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lab.name, schema: LabSchema }]),
    forwardRef(() => AuthModule),
    forwardRef(() => PatientModule),
    forwardRef(() => OrganizerModule),
    forwardRef(() => VisitDoctorModule),
    forwardRef(() => HospitalModule),
    MobileValidationModule,
  ],
  controllers: [LabController],
  providers: [LabService, PatientService, CronService],
  exports: [MongooseModule, LabService],
})
export class LabModule {}

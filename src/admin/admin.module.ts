import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { OrganizerModule } from 'src/organizer/organizer.module'
import { LabModule } from 'src/lab/lab.module'
import { HospitalModule } from 'src/hospital/hospital.module'
import { VisitDoctorModule } from 'src/visit-doctor/visit-doctor.module'
import { AuthModule } from 'src/auth/auth.module'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { PatientModule } from 'src/patient/patient.module'
import { Admin, AdminSchema } from './admin.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    forwardRef(() => OrganizerModule),
    forwardRef(() => HospitalModule),
    forwardRef(() => LabModule),
    forwardRef(() => PatientModule),
    forwardRef(() => VisitDoctorModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService, MongooseModule],
})
export class AdminModule {}

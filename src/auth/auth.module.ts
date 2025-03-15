import { forwardRef, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule } from '@nestjs/config'
import { OrganizerModule } from 'src/organizer/organizer.module'
import { HospitalModule } from 'src/hospital/hospital.module'
import { PatientModule } from 'src/patient/patient.module'
import { LabModule } from 'src/lab/lab.module'
import { VisitDoctorModule } from 'src/visit-doctor/visit-doctor.module'
import { MobileValidationModule } from 'src/mobile-validation/mobile-validation.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    forwardRef(() => OrganizerModule),
    forwardRef(() => HospitalModule),
    forwardRef(() => LabModule),
    forwardRef(() => VisitDoctorModule),
    forwardRef(() => PatientModule),
    MobileValidationModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

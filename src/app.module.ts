import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from './auth/auth.module'
import { OrganizerModule } from './organizer/organizer.module'
import { HospitalModule } from './hospital/hospital.module'
import { LabModule } from './lab/lab.module'
import { PatientModule } from './patient/patient.module'
import { VisitDoctorModule } from './visit-doctor/visit-doctor.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    ScheduleModule.forRoot(),
    AuthModule,
    OrganizerModule,
    HospitalModule,
    LabModule,
    VisitDoctorModule,
    PatientModule,
  ],
})
export class AppModule {}

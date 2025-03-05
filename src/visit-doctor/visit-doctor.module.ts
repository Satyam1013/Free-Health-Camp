import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { VisitDoctor, VisitDoctorSchema } from './visit-doctor.schema'
import { VisitDoctorService } from './visit-doctor.service'
import { VisitDoctorController } from './visit-doctor.controller'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VisitDoctor.name, schema: VisitDoctorSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [VisitDoctorController],
  providers: [VisitDoctorService],
  exports: [MongooseModule, VisitDoctorService], // ✅ Exporting VisitDoctorService
})
export class VisitDoctorModule {}

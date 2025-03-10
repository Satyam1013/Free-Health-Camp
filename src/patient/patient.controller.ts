import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { PatientService } from './patient.service'
import { AuthGuard } from 'src/auth/auth.guard'

@Controller('patient')
@UseGuards(AuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('available-doctors-services/:city')
  async getAvailableDoctorsAndServices(@Param('city') city: string) {
    return this.patientService.getAvailableDoctorsAndServices(city)
  }
}

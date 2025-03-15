import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common'
import { PatientService } from './patient.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'

@Controller('patient')
@UseGuards(AuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('profile')
  async getUserDetails(@Request() req: AuthenticatedRequest) {
    return this.patientService.getUserDetails(req.user._id)
  }

  @Get('available-doctors-services/:city')
  async getAvailableDoctorsAndServices(@Param('city') city: string) {
    return this.patientService.getAvailableDoctorsAndServices(city)
  }
}

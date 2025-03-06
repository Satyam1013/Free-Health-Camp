import { Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common'
import { PatientService } from './patient.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { Request as ExpressRequest } from 'express'

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    _id: string
    role?: string
  }
}

@Controller('patient')
@UseGuards(AuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('available-doctors-services/:city')
  async getAvailableDoctorsAndServices(@Param('city') city: string) {
    return this.patientService.getAvailableDoctorsAndServices(city)
  }

  @Post(':doctorId/book')
  async bookDoctor(@Request() req: AuthenticatedRequest, @Param('doctorId') doctorId: string) {
    const patientId = req.user._id
    return this.patientService.bookVisitDoctor(patientId, doctorId)
  }
}

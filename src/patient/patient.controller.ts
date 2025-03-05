import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { PatientService } from './patient.service'
import { AuthGuard } from 'src/auth/auth.guard'

@Controller('patient')
@UseGuards(AuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  // Get events happening in the patient's city
  @Get('events')
  getEvents(@Query('city') city: string) {
    return this.patientService.getEvents(city)
  }

  // Get doctors for a specific event
  @Get('events/:eventId/doctors')
  getDoctorsForEvent(@Param('eventId') eventId: string) {
    return this.patientService.getDoctorsForEvent(eventId)
  }

  // Get available visit-doctors in a city
  @Get('visit-doctors')
  getVisitDoctors(@Query('city') city: string) {
    return this.patientService.getVisitDoctors(city)
  }

  // Get available labs in a city
  @Get('labs')
  getLabs(@Query('city') city: string) {
    return this.patientService.getLabs(city)
  }

  // Get available hospitals in a city
  @Get('hospitals')
  getHospitals(@Query('city') city: string) {
    return this.patientService.getHospitals(city)
  }

  // Get services offered by a specific lab
  @Get('labs/:labId/services')
  getLabServices(@Param('labId') labId: string) {
    return this.patientService.getLabServices(labId)
  }

  // Get services offered by a specific hospital
  @Get('hospitals/:hospitalId/services')
  getHospitalServices(@Param('hospitalId') hospitalId: string) {
    return this.patientService.getHospitalServices(hospitalId)
  }
}

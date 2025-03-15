import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common'
import { PatientService } from './patient.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  async getUserDetails(@Request() req: AuthenticatedRequest) {
    return this.patientService.getUserDetails(req.user._id)
  }

  @Get('available-doctors-services/:city')
  async getAvailableDoctorsAndServices(@Param('city') city: string) {
    return this.patientService.getAvailableDoctorsAndServices(city)
  }

  // ✅ Book Doctor from an Event
  @Post('/:city/:eventId/:doctorId/book')
  async bookCampDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('city') city: string,
    @Param('eventId') eventId: string,
    @Param('doctorId') doctorId: string,
    @Body() patientData: any,
  ) {
    const patientId = req.user._id
    return this.patientService.bookCampDoctor(city, eventId, doctorId, patientId, patientData)
  }

  // ✅ Book Visit Doctor
  @Post(':visitDoctorId/:visitDetailId/book')
  async bookVisitDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('visitDoctorId') visitDoctorId: string,
    @Param('visitDetailId') visitDetailId: string,
    @Body() patientData: any,
  ) {
    const patientId = req.user._id
    return this.patientService.bookVisitDoctor(visitDoctorId, visitDetailId, patientId, patientData)
  }

  @Post(':hospitalId/:serviceId/book')
  async bookHospitalServices(
    @Request() req: AuthenticatedRequest,
    @Param('hospitalId') hospitalId: string,
    @Param('serviceId') serviceId: string,
    @Body() patientData: any,
  ) {
    const patientId = req.user._id
    return this.patientService.bookHospitalServices(hospitalId, serviceId, patientId, patientData)
  }

  @Post(':labId/:serviceId/book')
  async bookLabServices(
    @Request() req: AuthenticatedRequest,
    @Param('labId') labId: string,
    @Param('serviceId') serviceId: string,
    @Body() patientData: any,
  ) {
    const patientId = req.user._id
    return this.patientService.bookLabServices(labId, serviceId, patientId, patientData)
  }
}

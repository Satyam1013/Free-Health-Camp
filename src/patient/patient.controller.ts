import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common'
import { PatientService } from './patient.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'
import { BookDoctorDto } from './patient.dto'

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  async getPatientDetails(@Request() req: AuthenticatedRequest) {
    return this.patientService.getPatientDetails(req.user._id)
  }

  @Get('available-doctors-services/:city')
  async getAvailableDoctorsAndServices(@Param('city') city: string) {
    return this.patientService.getAvailableDoctorsAndServices(city)
  }

  // ✅ Book Doctor from an Event
  @Post('book-camp-doctor/:city/:eventId/:doctorId')
  @UseGuards(AuthGuard)
  async bookCampDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('city') city: string,
    @Param('eventId') eventId: string,
    @Param('doctorId') doctorId: string,
    @Body() patientData: BookDoctorDto,
  ) {
    const patientId = req.user._id
    return this.patientService.bookCampDoctor(city, eventId, doctorId, patientId, patientData)
  }

  // ✅ Book Visit Doctor
  @Post('book-visit-doctor/:visitDoctorId/:visitDetailId')
  @UseGuards(AuthGuard)
  async bookVisitDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('visitDoctorId') visitDoctorId: string,
    @Param('visitDetailId') visitDetailId: string,
    @Body() patientData: BookDoctorDto,
  ) {
    const patientId = req.user._id
    return this.patientService.bookVisitDoctor(visitDoctorId, visitDetailId, patientId, patientData)
  }

  @Post('book-hospital/:hospitalId/:serviceId')
  @UseGuards(AuthGuard)
  async bookHospitalServices(
    @Request() req: AuthenticatedRequest,
    @Param('hospitalId') hospitalId: string,
    @Param('serviceId') serviceId: string,
    @Body() patientData: BookDoctorDto,
  ) {
    const patientId = req.user._id
    return this.patientService.bookHospitalServices(hospitalId, serviceId, patientId, patientData)
  }

  @Post('book-lab/:labId/:serviceId')
  @UseGuards(AuthGuard)
  async bookLabServices(
    @Request() req: AuthenticatedRequest,
    @Param('labId') labId: string,
    @Param('serviceId') serviceId: string,
    @Body() patientData: BookDoctorDto,
  ) {
    const patientId = req.user._id
    return this.patientService.bookLabServices(labId, serviceId, patientId, patientData)
  }

  @Get('get-patients/:providerId/:serviceId')
  async getPatientsByService(@Param('providerId') providerId: string, @Param('serviceId') serviceId: string) {
    return this.patientService.getPatientsByService(providerId, serviceId)
  }

  @Get('get-all-patients/:providerId')
  async getPatientsByProvider(@Param('providerId') providerId: string) {
    return this.patientService.getPatientsByProvider(providerId)
  }
}

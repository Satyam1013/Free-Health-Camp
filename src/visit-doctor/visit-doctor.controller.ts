import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
import { VisitDoctorService } from './visit-doctor.service'
import { Request as ExpressRequest } from 'express'
import { AuthGuard } from 'src/auth/auth.guard'

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    _id: string
    role?: string
  }
}

@Controller('visit-doctor')
@UseGuards(AuthGuard)
export class VisitDoctorController {
  constructor(private readonly visitDoctorService: VisitDoctorService) {}

  @Post('create-visit-detail')
  async addEvent(@Request() req: AuthenticatedRequest, @Body() visitDetailData: any) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.createVisitDetail(visitDoctorId, visitDetailData)
  }

  @Post('create-staff/:visitDetailId')
  async addStaff(
    @Request() req: AuthenticatedRequest,
    @Param('visitDetailId') visitDetailId: string,
    @Body() staffData: any,
  ) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.createStaff(visitDoctorId, visitDetailId, staffData)
  }

  @Get(':doctorId/booked-patients')
  async getBookedPatients(@Param('doctorId') doctorId: string) {
    return this.visitDoctorService.getBookedPatients(doctorId)
  }

  @Get(':doctorId/patients')
  async getPatients(@Param('doctorId') doctorId: string) {
    return this.visitDoctorService.getPatients(doctorId)
  }

  @Put(':doctorId/patient/:patientId')
  async updatePatientStatus(
    @Param('doctorId') doctorId: string,
    @Param('patientId') patientId: string,
    @Body() updateData: any,
  ) {
    return this.visitDoctorService.updatePatientStatus(doctorId, patientId, updateData)
  }

  @Post(':doctorId/book')
  async bookDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('doctorId') doctorId: string,
    @Body() patientData: any,
  ) {
    const patientId = req.user._id
    return this.visitDoctorService.bookVisitDoctor(patientId, doctorId, patientData)
  }
}

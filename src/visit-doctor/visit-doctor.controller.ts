import { Body, Controller, Get, Param, Put, Request } from '@nestjs/common'
import { VisitDoctorService } from './visit-doctor.service'
import { Request as ExpressRequest } from 'express'

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    _id: string
    role?: string
  }
}

@Controller('visit-doctor')
export class VisitDoctorController {
  constructor(private readonly visitDoctorService: VisitDoctorService) {}

  @Get('create-staff')
  async createStaff(@Request() req: AuthenticatedRequest, @Body() staffData: any) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.createStaff(visitDoctorId, staffData)
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
    @Body() updateData: { status?: string; nextVisitDate?: string },
  ) {
    return this.visitDoctorService.updatePatientStatus(doctorId, patientId, updateData)
  }
}

// staff add, patient list update

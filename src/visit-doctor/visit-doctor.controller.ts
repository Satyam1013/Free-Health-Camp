import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
import { VisitDoctorService } from './visit-doctor.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'
import { CreateStaffDto, CreateVisitDetailDto, UpdateStaffDto, UpdateVisitDetailDto } from './visit-doctor.dto'
import { BookingStatus } from 'src/common/common.types'

@Controller('visit-doctor')
@UseGuards(AuthGuard)
export class VisitDoctorController {
  constructor(private readonly visitDoctorService: VisitDoctorService) {}

  @Post('create-visit-detail')
  async createVisitDetail(@Request() req: AuthenticatedRequest, @Body() visitDetailData: CreateVisitDetailDto) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.createVisitDetail(visitDoctorId, visitDetailData)
  }

  @Get('visit-details')
  async getAllVisitDetails(@Request() req: AuthenticatedRequest) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.getAllVisitDetails(visitDoctorId)
  }

  @Put(':visitDetailId/update')
  async updateVisitDetails(
    @Request() req: AuthenticatedRequest,
    @Param('visitDetailId') visitDetailId: string,
    @Body() updateData: UpdateVisitDetailDto,
  ) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.updateVisitDetails(visitDoctorId, visitDetailId, updateData)
  }

  @Delete(':visitDetailId/delete')
  async deleteVisitDetails(@Request() req: AuthenticatedRequest, @Param('visitDetailId') visitDetailId: string) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.deleteVisitDetails(visitDoctorId, visitDetailId)
  }

  @Post('create-staff/:visitDetailId')
  async createStaff(
    @Request() req: AuthenticatedRequest,
    @Param('visitDetailId') visitDetailId: string,
    @Body() staffData: CreateStaffDto,
  ) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.createStaff(visitDoctorId, visitDetailId, staffData)
  }

  @Put(':visitDetailId/staff/:staffId/update')
  async updateStaff(
    @Request() req: AuthenticatedRequest,
    @Param('visitDetailId') visitDetailId: string,
    @Param('staffId') staffId: string,
    @Body() updateData: UpdateStaffDto,
  ) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.updateStaff(visitDoctorId, visitDetailId, staffId, updateData)
  }

  @Delete(':visitDetailId/staff/:staffId/delete')
  async deleteStaff(
    @Request() req: AuthenticatedRequest,
    @Param('visitDetailId') visitDetailId: string,
    @Param('staffId') staffId: string,
  ) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.deleteStaff(visitDoctorId, visitDetailId, staffId)
  }

  @Put(':serviceId/patient/:patientId')
  async updatePatient(
    @Request() req: AuthenticatedRequest,
    @Param('serviceId') serviceId: string,
    @Param('patientId') patientId: string,
    @Body() updateData: Partial<{ status?: BookingStatus; nextVisitDate?: Date }>,
  ) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.updatePatient(visitDoctorId, serviceId, patientId, updateData)
  }

  // 👨‍⚕️👩‍⚕️ Only Staff Related
  @Get('get-all-patients')
  async getPatientsByStaff(@Request() req: AuthenticatedRequest) {
    const staffId = req.user._id
    return this.visitDoctorService.getPatientsByStaff(staffId)
  }
}

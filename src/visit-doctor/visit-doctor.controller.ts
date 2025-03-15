import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
import { VisitDoctorService } from './visit-doctor.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'

@Controller('visit-doctor')
@UseGuards(AuthGuard)
export class VisitDoctorController {
  constructor(private readonly visitDoctorService: VisitDoctorService) {}

  @Post('create-visit-detail')
  async addVisitDetail(@Request() req: AuthenticatedRequest, @Body() visitDetailData: any) {
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

  @Get('visit-details')
  async getAllVisitDetails(@Request() req: AuthenticatedRequest) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.getAllVisitDetails(visitDoctorId)
  }

  @Put(':visitDetailId/patient/:patientId')
  async updatePatient(
    @Request() req: AuthenticatedRequest,
    @Param('visitDetailId') visitDetailId: string,
    @Param('patientId') patientId: string,
    @Body() updateData: any,
  ) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.updatePatient(visitDoctorId, visitDetailId, patientId, updateData)
  }

  @Post(':visitDoctorId/:visitDetailId/book')
  async bookDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('visitDoctorId') visitDoctorId: string,
    @Param('visitDetailId') visitDetailId: string,
    @Body() patientData: any,
  ) {
    const patientId = req.user._id
    return this.visitDoctorService.bookVisitDoctor(patientId, visitDoctorId, visitDetailId, patientData)
  }

  /** ✅ NEW ENDPOINTS ADDED ✅ **/

  @Put(':visitDetailId/update')
  async updateVisitDetails(
    @Request() req: AuthenticatedRequest,
    @Param('visitDetailId') visitDetailId: string,
    @Body() updateData: any,
  ) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.updateVisitDetails(visitDoctorId, visitDetailId, updateData)
  }

  @Put(':visitDetailId/staff/:staffId/update')
  async updateStaff(
    @Request() req: AuthenticatedRequest,
    @Param('visitDetailId') visitDetailId: string,
    @Param('staffId') staffId: string,
    @Body() updateData: any,
  ) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.updateStaff(visitDoctorId, visitDetailId, staffId, updateData)
  }

  @Delete(':visitDetailId/delete')
  async deleteVisitDetails(@Request() req: AuthenticatedRequest, @Param('visitDetailId') visitDetailId: string) {
    const visitDoctorId = req.user._id
    return this.visitDoctorService.deleteVisitDetails(visitDoctorId, visitDetailId)
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
}

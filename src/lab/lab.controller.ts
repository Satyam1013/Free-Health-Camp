import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
import { LabService } from './lab.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'
import {
  CreateAvailableServiceDto,
  CreateStaffDto,
  EditStaffDto,
  UpdateAvailableServiceDto,
  UpdateLabTimeDto,
} from './lab.dto'
import { BookingStatus } from 'src/patient/patient.schema'

@Controller('labs')
@UseGuards(AuthGuard)
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Post('create-available-services')
  async addAvailableServices(@Request() req: AuthenticatedRequest, @Body() servicesData: CreateAvailableServiceDto) {
    const labId = req.user._id
    return this.labService.createAvailableServices(labId, servicesData)
  }

  @Put('update-available-service/:serviceId')
  async updateAvailableService(
    @Request() req: AuthenticatedRequest,
    @Param('serviceId') serviceId: string,
    @Body() updatedData: UpdateAvailableServiceDto,
  ) {
    const labId = req.user._id
    return this.labService.updateAvailableService(labId, serviceId, updatedData)
  }

  @Delete('delete-available-service/:serviceId')
  async deleteAvailableService(@Request() req: AuthenticatedRequest, @Param('serviceId') serviceId: string) {
    const labId = req.user._id
    return this.labService.deleteAvailableService(labId, serviceId)
  }

  @Get('lab-details')
  async getLabDetails(@Request() req: AuthenticatedRequest) {
    const labId = req.user._id
    return this.labService.getLabDetails(labId)
  }

  @Post('create-staff')
  async createStaff(@Request() req: AuthenticatedRequest, @Body() staffData: CreateStaffDto) {
    const labId = req.user._id
    return this.labService.createStaff(labId, staffData)
  }

  @Put('edit-staff/:staffId')
  async editStaff(
    @Request() req: AuthenticatedRequest,
    @Param('staffId') staffId: string,
    @Body() updatedData: EditStaffDto,
  ) {
    const labId = req.user._id
    return this.labService.editStaff(labId, staffId, updatedData)
  }

  @Delete('delete-staff/:staffId')
  async deleteStaff(@Request() req: AuthenticatedRequest, @Param('staffId') staffId: string) {
    const labId = req.user._id
    return this.labService.deleteStaff(labId, staffId)
  }

  @Put('update-time')
  async updateLabTime(@Request() req: AuthenticatedRequest, @Body() updateTimeDto: UpdateLabTimeDto) {
    const labId = req.user._id
    return this.labService.updateLabTime(labId, updateTimeDto)
  }

  // 👨‍⚕️👩‍⚕️ Only Staff Related
  @Get('get-all-patients')
  async getPatientsByStaff(@Request() req: AuthenticatedRequest) {
    const staffId = req.user._id
    return this.labService.getPatientsByStaff(staffId)
  }

  @Put(':serviceId/patient/:patientId')
  async updatePatient(
    @Request() req: AuthenticatedRequest,
    @Param('serviceId') serviceId: string,
    @Param('patientId') patientId: string,
    @Body() updateData: Partial<{ status?: BookingStatus }>,
  ) {
    const labId = req.user._id
    return this.labService.updatePatient(labId, serviceId, patientId, updateData)
  }
}

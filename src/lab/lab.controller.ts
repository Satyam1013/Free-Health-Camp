import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
import { LabService } from './lab.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'
import { CreateStaffDto } from './lab.dto'

@Controller('labs')
@UseGuards(AuthGuard)
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Post('create-available-services')
  async addAvailableServices(@Request() req: AuthenticatedRequest, @Body() testData: any) {
    const labId = req.user._id
    return this.labService.createAvailableServices(labId, testData)
  }

  @Put('update-available-service/:serviceName')
  async updateAvailableService(
    @Request() req: AuthenticatedRequest,
    @Param('serviceName') serviceName: string,
    @Body() updatedData: { name?: string; fee?: number },
  ) {
    const labId = req.user._id
    return this.labService.updateAvailableService(labId, serviceName, updatedData)
  }

  @Delete('delete-available-service/:serviceName')
  async deleteAvailableService(@Request() req: AuthenticatedRequest, @Param('serviceName') serviceName: string) {
    const labId = req.user._id
    return this.labService.deleteAvailableService(labId, serviceName)
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
  async editStaff(@Request() req: AuthenticatedRequest, @Param('staffId') staffId: string, @Body() updatedData: any) {
    const labId = req.user._id
    return this.labService.editStaff(labId, staffId, updatedData)
  }

  @Delete('delete-staff/:staffId')
  async deleteStaff(@Request() req: AuthenticatedRequest, @Param('staffId') staffId: string) {
    const labId = req.user._id
    return this.labService.deleteStaff(labId, staffId)
  }

  @Put('update-time')
  async updateLabTime(
    @Request() req: AuthenticatedRequest,
    @Body() updateTimeDto: { startTime?: string; endTime?: string },
  ) {
    const labId = req.user._id
    return this.labService.updateLabTime(labId, updateTimeDto)
  }
}

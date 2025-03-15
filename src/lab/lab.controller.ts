import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
import { LabService } from './lab.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'

@Controller('labs')
@UseGuards(AuthGuard)
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Post('create-available-services')
  async addAvailableServices(@Request() req: AuthenticatedRequest, @Body() testData: any) {
    const labId = req.user._id
    return this.labService.createAvailableServices(labId, testData)
  }

  @Get('available-services')
  async getAvailableServices(@Request() req: AuthenticatedRequest) {
    const labId = req.user._id
    return this.labService.getAvailableServices(labId)
  }

  @Post('create-staff')
  async createStaff(@Request() req: AuthenticatedRequest, @Body() staffData: any) {
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
}

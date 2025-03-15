import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { HospitalService } from './hospital.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'

@Controller('hospital')
@UseGuards(AuthGuard)
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Post('create-available-test')
  async createAvailableServices(@Request() req: AuthenticatedRequest, @Body() servicesData: any) {
    const hospitalId = req.user._id
    return this.hospitalService.createAvailableServices(hospitalId, servicesData)
  }

  @Get('available-tests')
  async getAvailableServices(@Request() req: AuthenticatedRequest) {
    const hospitalId = req.user._id
    return this.hospitalService.getAvailableServices(hospitalId)
  }

  @Get('create-staff')
  async createStaff(@Request() req: AuthenticatedRequest, @Body() staffData: any) {
    const hospitalId = req.user._id
    return this.hospitalService.createStaff(hospitalId, staffData)
  }
}

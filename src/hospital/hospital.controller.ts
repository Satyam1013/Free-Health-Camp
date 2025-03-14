import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
import { HospitalService } from './hospital.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'

@Controller('hospital')
@UseGuards(AuthGuard)
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Post('create-available-service')
  async createAvailableServices(@Request() req: AuthenticatedRequest, @Body() servicesData: any) {
    const hospitalId = req.user._id
    return this.hospitalService.createAvailableServices(hospitalId, servicesData)
  }

  @Get('available-tests')
  async getAvailableServices(@Request() req: AuthenticatedRequest) {
    const hospitalId = req.user._id
    return this.hospitalService.getAvailableServices(hospitalId)
  }

  @Post('create-doctor')
  async createDoctor(@Request() req: AuthenticatedRequest, @Body() doctorData: any) {
    const hospitalId = req.user._id
    return this.hospitalService.createDoctor(hospitalId, doctorData)
  }

  @Put('edit-doctor/:doctorId')
  async editDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('doctorId') doctorId: string,
    @Body() updatedData: any,
  ) {
    const hospitalId = req.user._id
    return this.hospitalService.editDoctor(hospitalId, doctorId, updatedData)
  }

  @Delete('delete-doctor/:doctorId')
  async deleteDoctor(@Request() req: AuthenticatedRequest, @Param('doctorId') doctorId: string) {
    const hospitalId = req.user._id
    return this.hospitalService.deleteDoctor(hospitalId, doctorId)
  }

  @Post('create-staff')
  async createStaff(@Request() req: AuthenticatedRequest, @Body() staffData: any) {
    const hospitalId = req.user._id
    return this.hospitalService.createStaff(hospitalId, staffData)
  }

  @Put('edit-staff/:staffId')
  async editStaff(@Request() req: AuthenticatedRequest, @Param('staffId') staffId: string, @Body() updatedData: any) {
    const hospitalId = req.user._id
    return this.hospitalService.editStaff(hospitalId, staffId, updatedData)
  }

  @Delete('delete-staff/:staffId')
  async deleteStaff(@Request() req: AuthenticatedRequest, @Param('staffId') staffId: string) {
    const hospitalId = req.user._id
    return this.hospitalService.deleteStaff(hospitalId, staffId)
  }
}

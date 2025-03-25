import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
import { HospitalService } from './hospital.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'
import {
  CreateAvailableServiceDto,
  CreateDoctorDto,
  CreateStaffDto,
  EditDoctorDto,
  EditStaffDto,
  UpdateAvailableServiceDto,
  UpdateHospitalTimeDto,
} from './hospital.dto'
import { BookingStatus } from 'src/common/common.types'

@Controller('hospital')
@UseGuards(AuthGuard)
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  // 🏥 Available Services
  @Post('create-available-services')
  async createAvailableServices(@Request() req: AuthenticatedRequest, @Body() data: CreateAvailableServiceDto) {
    return this.hospitalService.createAvailableServices(req.user._id, data)
  }

  @Put('update-available-service/:serviceId')
  async updateAvailableService(
    @Request() req: AuthenticatedRequest,
    @Param('serviceId') serviceId: string,
    @Body() data: UpdateAvailableServiceDto,
  ) {
    return this.hospitalService.updateAvailableService(req.user._id, serviceId, data)
  }

  @Delete('delete-available-service/:serviceId')
  async deleteAvailableService(@Request() req: AuthenticatedRequest, @Param('serviceId') serviceId: string) {
    return this.hospitalService.deleteAvailableService(req.user._id, serviceId)
  }

  // ℹ️ Hospital Details & Timings
  @Get('hospital-details')
  async getHospitalDetails(@Request() req: AuthenticatedRequest) {
    return this.hospitalService.getHospitalDetails(req.user._id)
  }

  @Put('update-time')
  async updateHospitalTime(@Request() req: AuthenticatedRequest, @Body() data: UpdateHospitalTimeDto) {
    return this.hospitalService.updateHospitalTime(req.user._id, data)
  }

  // 👨‍⚕️ Doctors Management
  @Post('create-doctor')
  async createDoctor(@Request() req: AuthenticatedRequest, @Body() data: CreateDoctorDto) {
    return this.hospitalService.createDoctor(req.user._id, data)
  }

  @Put('edit-doctor/:doctorId')
  async editDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('doctorId') doctorId: string,
    @Body() data: EditDoctorDto,
  ) {
    return this.hospitalService.editDoctor(req.user._id, doctorId, data)
  }

  @Delete('delete-doctor/:doctorId')
  async deleteDoctor(@Request() req: AuthenticatedRequest, @Param('doctorId') doctorId: string) {
    return this.hospitalService.deleteDoctor(req.user._id, doctorId)
  }

  // 👩‍⚕️ Staff Management
  @Post('create-staff')
  async createStaff(@Request() req: AuthenticatedRequest, @Body() data: CreateStaffDto) {
    return this.hospitalService.createStaff(req.user._id, data)
  }

  @Put('edit-staff/:staffId')
  async editStaff(@Request() req: AuthenticatedRequest, @Param('staffId') staffId: string, @Body() data: EditStaffDto) {
    return this.hospitalService.editStaff(req.user._id, staffId, data)
  }

  @Delete('delete-staff/:staffId')
  async deleteStaff(@Request() req: AuthenticatedRequest, @Param('staffId') staffId: string) {
    return this.hospitalService.deleteStaff(req.user._id, staffId)
  }

  // 📋 Patient Management (Staff Only)
  @Get('get-all-patients')
  async getPatientsByStaff(@Request() req: AuthenticatedRequest) {
    return this.hospitalService.getPatientsByStaff(req.user._id)
  }

  @Put(':serviceId/patient/:patientId')
  async updatePatient(
    @Request() req: AuthenticatedRequest,
    @Param('serviceId') serviceId: string,
    @Param('patientId') patientId: string,
    @Body() data: Partial<{ status?: BookingStatus }>,
  ) {
    return this.hospitalService.updatePatientStatus(req.user._id, req.user.role, serviceId, patientId, data)
  }
}

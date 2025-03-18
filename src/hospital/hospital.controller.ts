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
import { BookingStatus } from 'src/patient/patient.schema'

@Controller('hospital')
@UseGuards(AuthGuard)
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Post('create-available-services')
  async createAvailableServices(@Request() req: AuthenticatedRequest, @Body() servicesData: CreateAvailableServiceDto) {
    const hospitalId = req.user._id
    return this.hospitalService.createAvailableServices(hospitalId, servicesData)
  }

  @Put('update-available-service/:serviceId')
  async updateAvailableService(
    @Request() req: AuthenticatedRequest,
    @Param('serviceId') serviceId: string,
    @Body() updatedData: UpdateAvailableServiceDto,
  ) {
    const hospitalId = req.user._id
    return this.hospitalService.updateAvailableService(hospitalId, serviceId, updatedData)
  }

  @Delete('delete-available-service/:serviceId')
  async deleteAvailableService(@Request() req: AuthenticatedRequest, @Param('serviceId') serviceId: string) {
    const hospitalId = req.user._id
    return this.hospitalService.deleteAvailableService(hospitalId, serviceId)
  }

  @Get('hospital-details')
  async getHospitalDetails(@Request() req: AuthenticatedRequest) {
    const hospitalId = req.user._id
    return this.hospitalService.getHospitalDetails(hospitalId)
  }

  @Post('create-doctor')
  async createDoctor(@Request() req: AuthenticatedRequest, @Body() doctorData: CreateDoctorDto) {
    const hospitalId = req.user._id
    return this.hospitalService.createDoctor(hospitalId, doctorData)
  }

  @Put('edit-doctor/:doctorId')
  async editDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('doctorId') doctorId: string,
    @Body() updatedData: EditDoctorDto,
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
  async createStaff(@Request() req: AuthenticatedRequest, @Body() staffData: CreateStaffDto) {
    const hospitalId = req.user._id
    return this.hospitalService.createStaff(hospitalId, staffData)
  }

  @Put('edit-staff/:staffId')
  async editStaff(
    @Request() req: AuthenticatedRequest,
    @Param('staffId') staffId: string,
    @Body() updatedData: EditStaffDto,
  ) {
    const hospitalId = req.user._id
    return this.hospitalService.editStaff(hospitalId, staffId, updatedData)
  }

  @Delete('delete-staff/:staffId')
  async deleteStaff(@Request() req: AuthenticatedRequest, @Param('staffId') staffId: string) {
    const hospitalId = req.user._id
    return this.hospitalService.deleteStaff(hospitalId, staffId)
  }

  @Put('update-time')
  async updateHospitalTime(@Request() req: AuthenticatedRequest, @Body() updateTimeDto: UpdateHospitalTimeDto) {
    const hospitalId = req.user._id
    return this.hospitalService.updateHospitalTime(hospitalId, updateTimeDto)
  }

  // 👨‍⚕️👩‍⚕️ Only Staff Related
  @Get('get-all-patients')
  async getPatientsByProvider(@Request() req: AuthenticatedRequest) {
    const staffId = req.user._id
    return this.hospitalService.getPatientsByStaff(staffId)
  }

  @Put(':serviceId/patient/:patientId')
  async updatePatient(
    @Request() req: AuthenticatedRequest,
    @Param('serviceId') serviceId: string,
    @Param('patientId') patientId: string,
    @Body() updateData: Partial<{ status?: BookingStatus }>,
  ) {
    const hospitalId = req.user._id
    return this.hospitalService.updatePatient(hospitalId, serviceId, patientId, updateData)
  }
}

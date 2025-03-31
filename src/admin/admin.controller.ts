import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { AdminService } from './admin.service'
import { PaidStatus } from 'src/common/common.types'
import { AdminAuthGuard } from './admin.auth.guard'

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return await this.adminService.getDashboardStats()
  }

  @Get('get-details/:city')
  async getDashboardStatsCityWise(@Param('city') city: string) {
    return await this.adminService.getDashboardStatsCityWise(city)
  }

  @Patch('update-visit-doctor-fee/:visitDoctorId')
  async updateVisitDoctorRevenue(
    @Param('visitDoctorId') visitDoctorId: string,
    @Body() updateData: { feeBalance?: number; paidStatus?: PaidStatus; serviceStop?: boolean },
  ) {
    return await this.adminService.updateVisitDoctorRevenue(visitDoctorId, updateData)
  }

  @Patch('update-lab-fee/:ladId')
  async updateLabRevenue(
    @Param('ladId') ladId: string,
    @Body() updateData: { feeBalance?: number; paidStatus?: PaidStatus; serviceStop?: boolean },
  ) {
    return await this.adminService.updateLabRevenue(ladId, updateData)
  }

  @Patch('update-hospital-fee/:hospitalId')
  async updateHospitalRevenue(
    @Param('hospitalId') hospitalId: string,
    @Body() updateData: { feeBalance?: number; paidStatus?: PaidStatus; serviceStop?: boolean },
  ) {
    return await this.adminService.updateHospitalRevenue(hospitalId, updateData)
  }

  @Delete('delete-visit-doctor/:visitDoctorId')
  async deleteVisitDoctor(@Param('visitDoctorId') visitDoctorId: string) {
    return await this.adminService.deleteVisitDoctor(visitDoctorId)
  }

  @Delete('delete-lab/:labId')
  async deleteLab(@Param('labId') labId: string) {
    return await this.adminService.deleteLab(labId)
  }

  @Delete('delete-hospital/:hospitalId')
  async deleteHospital(@Param('hospitalId') hospitalId: string) {
    return await this.adminService.deleteHospital(hospitalId)
  }

  @Get('get-pending-labs')
  async getPendingLabs() {
    return await this.adminService.getPendingLabs()
  }

  @Get('get-pending-hospitals')
  async getPendingHospitals() {
    return await this.adminService.getPendingHospitals()
  }

  @Get('get-pending-visit-doctors')
  async getPendingVisitDoctors() {
    return await this.adminService.getPendingVisitDoctors()
  }
}
// serviceStop true if endTime is over paidStatus Pending, feeBalance is > 0 then cron job

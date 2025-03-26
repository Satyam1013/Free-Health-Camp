import { Body, Controller, Get, Param, Patch } from '@nestjs/common'
import { AdminService } from './admin.service'
import { PaidStatus } from 'src/common/common.types'

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  // ✅ Fetch Admin Dashboard Data
  @Get('dashboard')
  async getDashboardStats() {
    return await this.adminService.getDashboardStats()
  }

  @Get('get-details/:city')
  async getDashboardStatsCityWise(@Param('city') city: string) {
    return await this.adminService.getDashboardStatsCityWise(city)
  }

  // ✅ Mark Visit as Completed and Update Revenue
  @Patch('update-visit-doctor-fee/:visitDoctorId')
  async updateVisitDoctorRevenue(
    @Param('visitDoctorId') visitDoctorId: string,
    @Body() updateData: { feeBalance?: number; paidStatus?: PaidStatus },
  ) {
    return await this.adminService.updateVisitDoctorRevenue(visitDoctorId, updateData)
  }

  @Patch('update-lab-fee/:ladId')
  async updateLabRevenue(
    @Param('ladId') ladId: string,
    @Body() updateData: { feeBalance?: number; paidStatus?: PaidStatus },
  ) {
    return await this.adminService.updateLabRevenue(ladId, updateData)
  }

  @Patch('update-hospital-fee/:hospitalId')
  async updateHospitalRevenue(
    @Param('hospitalId') hospitalId: string,
    @Body() updateData: { feeBalance?: number; paidStatus?: PaidStatus },
  ) {
    return await this.adminService.updateHospitalRevenue(hospitalId, updateData)
  }
}

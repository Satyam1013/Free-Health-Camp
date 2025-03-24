import { Body, Controller, Get, Param, Patch } from '@nestjs/common'
import { AdminService } from './admin.service'

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
  @Patch('visit/status/:visitId')
  async updateVisitDetailsRevenue(@Param('visitId') visitId: string) {
    return await this.adminService.updateVisitDetailsRevenue(visitId, status)
  }

  @Patch('update-lab-revenue')
  async updateLabRevenue(@Body('patientId') patientId: string, @Body('serviceId') serviceId: string) {
    return await this.adminService.updateLabRevenue(patientId, serviceId)
  }

  @Patch('update-lab-revenue')
  async updateHospitalRevenue(@Body('patientId') patientId: string, @Body('serviceId') serviceId: string) {
    return await this.adminService.updateHospitalRevenue(patientId, serviceId)
  }
}

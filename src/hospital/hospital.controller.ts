import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common'
import { HospitalService } from './hospital.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { Request as ExpressRequest } from 'express'

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    hospitalId: string
  }
}

@Controller('hospitals')
@UseGuards(AuthGuard)
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  // ✅ Only HOSPITAL role can create a hospital
  @Post('create')
  async createHospital(@Body() hospitalData: any) {
    return this.hospitalService.createHospital(hospitalData)
  }

  @Get(':city')
  async getHospitalsByCity(@Param('city') city: string) {
    return this.hospitalService.getHospitalsByCity(city)
  }

  // ✅ Hospital admins can only view their own hospital services (hospitalId from middleware)
  @Get('services')
  async getHospitalServices(@Req() req: AuthenticatedRequest) {
    const hospitalId = req.user.hospitalId
    return this.hospitalService.getHospitalServices(hospitalId)
  }
}

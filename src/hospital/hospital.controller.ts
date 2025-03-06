import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common'
import { HospitalService } from './hospital.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { Request as ExpressRequest } from 'express'

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    _id: string
    role?: string
  }
}

@Controller('hospital')
@UseGuards(AuthGuard)
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Get(':city')
  async getHospitalsByCity(@Param('city') city: string) {
    return this.hospitalService.getHospitalsByCity(city)
  }

  // ✅ Hospital admins can only view their own hospital services (hospitalId from middleware)
  @Get('services')
  async getHospitalServices(@Request() req: AuthenticatedRequest) {
    const hospitalId = req.user._id
    return this.hospitalService.getHospitalServices(hospitalId)
  }
}

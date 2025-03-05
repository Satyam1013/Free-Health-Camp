import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { LabService } from './lab.service'
import { AuthGuard } from 'src/auth/auth.guard'

@Controller('labs')
@UseGuards(AuthGuard)
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Post('create')
  async createLab(@Body() labData: any) {
    return this.labService.createLab(labData)
  }

  @Get(':city')
  async getLabsByCity(@Param('city') city: string) {
    return this.labService.getLabsByCity(city)
  }

  @Get(':labId/tests')
  async getLabTests(@Param('labId') labId: string) {
    return this.labService.getLabTests(labId)
  }
}

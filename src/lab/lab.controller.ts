import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { LabService } from './lab.service'
import { AuthGuard } from 'src/auth/auth.guard'

@Controller('labs')
@UseGuards(AuthGuard)
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Get(':city')
  async getLabsByCity(@Param('city') city: string) {
    return this.labService.getLabsByCity(city)
  }
}

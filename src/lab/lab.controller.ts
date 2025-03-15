import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { LabService } from './lab.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'

@Controller('labs')
@UseGuards(AuthGuard)
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Post('create-available-test')
  async addAvailableTest(@Request() req: AuthenticatedRequest, @Body() testData: any) {
    const labId = req.user._id
    return this.labService.createAvailableTest(labId, testData)
  }

  @Get('available-tests')
  async getAvailableTest(@Request() req: AuthenticatedRequest) {
    const labId = req.user._id
    return this.labService.getAvailableTest(labId)
  }
}

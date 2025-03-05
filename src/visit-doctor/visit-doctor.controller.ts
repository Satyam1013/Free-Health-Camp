import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common'
import { VisitDoctorService } from './visit-doctor.service'
import { CreateVisitDoctorDto } from './visit-doctor.dto'
import { UpdateVisitDoctorDto } from './visit-doctor.dto'

@Controller('visit-doctor')
export class VisitDoctorController {
  constructor(private readonly visitDoctorService: VisitDoctorService) {}

  @Post()
  async create(@Body() createVisitDoctorDto: CreateVisitDoctorDto) {
    return this.visitDoctorService.create(createVisitDoctorDto)
  }

  @Get()
  async findAll() {
    return this.visitDoctorService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.visitDoctorService.findOne(id)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateVisitDoctorDto: UpdateVisitDoctorDto) {
    return this.visitDoctorService.update(id, updateVisitDoctorDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.visitDoctorService.remove(id)
  }
}

import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { VisitDoctor, VisitDoctorDocument } from './visit-doctor.schema'
import { CreateVisitDoctorDto } from './visit-doctor.dto'
import { UpdateVisitDoctorDto } from './visit-doctor.dto'

@Injectable()
export class VisitDoctorService {
  constructor(@InjectModel(VisitDoctor.name) private readonly visitDoctorModel: Model<VisitDoctorDocument>) {}

  async create(createVisitDoctorDto: CreateVisitDoctorDto): Promise<VisitDoctor> {
    const visitDoctor = new this.visitDoctorModel(createVisitDoctorDto)
    return visitDoctor.save()
  }

  async findAll(): Promise<VisitDoctor[]> {
    return this.visitDoctorModel.find().exec()
  }

  async findOne(id: string): Promise<VisitDoctor> {
    const visitDoctor = await this.visitDoctorModel.findById(id).exec()
    if (!visitDoctor) {
      throw new NotFoundException(`VisitDoctor with ID ${id} not found`)
    }
    return visitDoctor
  }

  async update(id: string, updateVisitDoctorDto: UpdateVisitDoctorDto): Promise<VisitDoctor> {
    const updatedVisitDoctor = await this.visitDoctorModel
      .findByIdAndUpdate(id, updateVisitDoctorDto, {
        new: true,
        runValidators: true,
      })
      .exec()

    if (!updatedVisitDoctor) {
      throw new NotFoundException(`VisitDoctor with ID ${id} not found`)
    }
    return updatedVisitDoctor
  }

  async remove(id: string): Promise<VisitDoctor> {
    const deletedVisitDoctor = await this.visitDoctorModel.findByIdAndDelete(id).exec()
    if (!deletedVisitDoctor) {
      throw new NotFoundException(`VisitDoctor with ID ${id} not found`)
    }
    return deletedVisitDoctor
  }
}

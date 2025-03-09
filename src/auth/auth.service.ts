import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { Organizer, OrganizerDocument } from '../organizer/organizer.schema'
import { VisitDoctor, VisitDoctorDocument } from '../visit-doctor/visit-doctor.schema'
import { Lab, LabDocument } from '../lab/lab.schema'
import { Hospital, HospitalDocument } from '../hospital/hospital.schema'
import { Patient, PatientDocument } from '../patient/patient.schema'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Organizer.name) private organizerModel: Model<OrganizerDocument>,
    @InjectModel(VisitDoctor.name) private visitDoctorModel: Model<VisitDoctorDocument>,
    @InjectModel(Lab.name) private labModel: Model<LabDocument>,
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(userDto: any): Promise<{ message: string; username: string }> {
    const { mobile, password, role, ...otherData } = userDto

    // Choose the correct model based on role
    const model = this.getModelByRole(role) as Model<any>
    if (!model) {
      throw new BadRequestException('Invalid role provided')
    }

    // Check if user already exists
    const existingUser = await model.findOne({ mobile })
    if (existingUser) {
      throw new BadRequestException('User with this mobile number already exists')
    }

    // Create new user
    const newUser = new model({
      ...otherData,
      mobile,
      password: await bcrypt.hash(password, 10),
    })
    await newUser.save()

    return {
      message: 'User registered successfully',
      username: newUser.username,
    }
  }

  async login(userDto: any): Promise<{ access_token: string; userDetails: any }> {
    const { mobile, password } = userDto
    let user: any = null
    let role = ''

    // 1️⃣ Check if the mobile exists in the Organizer collection
    const organizer = await this.organizerModel.findOne({ mobile })
    if (organizer) {
      user = organizer
      role = 'Organizer'
    } else {
      // 2️⃣ Check inside events for Doctors & Staff
      const event = await this.organizerModel.findOne({ 'events.doctors.mobile': mobile })
      if (event) {
        user = event.events
          .find((ev) => ev.doctors.some((doc) => doc.mobile === mobile))
          ?.doctors.find((doc) => doc.mobile === mobile)
        role = 'Doctor'
      }

      if (!user) {
        const eventWithStaff = await this.organizerModel.findOne({ 'events.staff.mobile': mobile })
        if (eventWithStaff) {
          user = eventWithStaff.events
            .find((ev) => ev.staff.some((staff) => staff.mobile === mobile))
            ?.staff.find((staff) => staff.mobile === mobile)
          role = 'Staff'
        }
      }
    }

    // 3️⃣ Check Other Roles (VisitDoctor, Lab, Hospital, Patient)
    if (!user) {
      user = await this.visitDoctorModel.findOne({ mobile })
      if (user) role = 'VisitDoctor'
    }
    if (!user) {
      user = await this.labModel.findOne({ mobile })
      if (user) role = 'Lab'
    }
    if (!user) {
      user = await this.hospitalModel.findOne({ mobile })
      if (user) role = 'Hospital'
    }
    if (!user) {
      user = await this.patientModel.findOne({ mobile })
      if (user) role = 'Patient'
    }

    // 4️⃣ If User Not Found, Throw Unauthorized Error
    if (!user) {
      throw new UnauthorizedException('Invalid mobile number or password')
    }

    // 5️⃣ Compare Passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid mobile number or password')
    }

    // 6️⃣ Generate JWT Token
    const payload = { _id: user._id, role }
    const access_token = this.jwtService.sign(payload)

    // 7️⃣ Remove sensitive data before sending response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userDetails } = user.toObject ? user.toObject() : user

    return { access_token, userDetails }
  }

  private getModelByRole(role: string) {
    switch (role) {
      case 'Organizer':
        return this.organizerModel
      case 'VisitDoctor':
        return this.visitDoctorModel
      case 'Lab':
        return this.labModel
      case 'Hospital':
        return this.hospitalModel
      case 'Patient':
        return this.patientModel
      default:
        return null
    }
  }
}

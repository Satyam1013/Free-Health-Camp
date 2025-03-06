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

  async login(userDto: any): Promise<{ access_token: string }> {
    const { mobile, password } = userDto
    let user: any = null
    let role = ''

    // 1. Check if the mobile exists in the organizer collection (including staff and doctors)
    const organizer = await this.organizerModel.findOne({
      $or: [{ mobile }, { 'staff.mobile': mobile }, { 'doctors.mobile': mobile }],
    })

    if (organizer) {
      user = organizer // Organizer logs in
      role = 'Organizer'

      // Check if the mobile belongs to staff
      const staffMember = organizer.staff.find((staff) => staff.mobile === mobile)
      if (staffMember) {
        user = staffMember
        role = 'Organizer' // Staff also gets Organizer role
      }

      // Check if the mobile belongs to a doctor
      const doctor = organizer.doctors.find((doc) => doc.mobile === mobile)
      if (doctor) {
        user = doctor
        role = 'Organizer' // Doctors also get Organizer role
      }
    }

    // 2. If not found in Organizer, check other roles
    if (!user) {
      user = await this.visitDoctorModel.findOne({ mobile })
      role = 'VisitDoctor'
    }
    if (!user) {
      user = await this.labModel.findOne({ mobile })
      role = 'Lab'
    }
    if (!user) {
      user = await this.hospitalModel.findOne({ mobile })
      role = 'Hospital'
    }
    if (!user) {
      user = await this.patientModel.findOne({ mobile })
      role = 'Patient'
    }

    if (!user) {
      throw new UnauthorizedException('Invalid mobile number or password')
    }

    // 3. Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid mobile number or password')
    }

    // 4. Generate JWT token
    const payload = { _id: user._id, role: role }
    const access_token = this.jwtService.sign(payload)

    return { access_token }
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

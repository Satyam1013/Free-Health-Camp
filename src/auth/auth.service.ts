import { Injectable, BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { Organizer, OrganizerDocument } from '../organizer/organizer.schema'
import { VisitDoctor, VisitDoctorDocument } from '../visit-doctor/visit-doctor.schema'
import { Lab, LabDocument } from '../lab/lab.schema'
import { Hospital, HospitalDocument } from '../hospital/hospital.schema'
import { Patient, PatientDocument } from '../patient/patient.schema'
import { MobileValidationService } from 'src/common/mobile-validation.service'
import { CreateUserDto, UserRole } from './create-user.dto'
import { LoginDto } from './login.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Organizer.name) private organizerModel: Model<OrganizerDocument>,
    @InjectModel(VisitDoctor.name) private visitDoctorModel: Model<VisitDoctorDocument>,
    @InjectModel(Lab.name) private labModel: Model<LabDocument>,
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    private readonly mobileValidationService: MobileValidationService,
    private readonly jwtService: JwtService,
  ) {}
  async signup(signupDto: CreateUserDto): Promise<{ message: string; username: string }> {
    try {
      const { mobile, password, role, ...otherData } = signupDto

      // Choose the correct model based on role
      const model = this.getModelByRole(role) as Model<any>
      if (!model) {
        throw new BadRequestException('Invalid role provided')
      }

      // 🔍 Check mobile existence across ALL roles
      await this.mobileValidationService.checkDuplicateMobile(mobile)

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
    } catch (error) {
      console.error('Signup Error:', error.message || error)
      throw new InternalServerErrorException('Signup failed, please try again')
    }
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; userDetails: any }> {
    try {
      const { mobile, password } = loginDto
      let user: any = null
      let role: UserRole | '' = ''

      // 1️⃣ Check if the mobile exists in the Organizer collection
      const organizer = await this.organizerModel.findOne({ mobile })
      if (organizer) {
        user = organizer
        role = UserRole.ORGANIZER
      } else {
        // 2️⃣ Check inside events for Doctors & Staff under Organizer
        const event = await this.organizerModel.findOne({
          $or: [{ 'events.doctors.mobile': mobile }, { 'events.staff.mobile': mobile }],
        })

        if (event) {
          const foundEvent = event.events.find(
            (ev) =>
              ev.doctors.some((doc) => doc.mobile === mobile) || ev.staff.some((staff) => staff.mobile === mobile),
          )

          if (foundEvent) {
            user = foundEvent.doctors.find((doc) => doc.mobile === mobile)
            role = user ? UserRole.ORGANIZER_DOCTOR : ''

            if (!user) {
              user = foundEvent.staff.find((staff) => staff.mobile === mobile)
              role = user ? UserRole.ORGANIZER_STAFF : ''
            }
          }
        }
      }

      // 3️⃣ Check Other Roles (VisitDoctor, Lab, Hospital, Patient)
      if (!user) {
        user = await this.visitDoctorModel.findOne({ mobile })
        if (user) role = UserRole.VISIT_DOCTOR
      }
      if (!user) {
        user = await this.labModel.findOne({ mobile })
        if (user) role = UserRole.LAB
      }
      if (!user) {
        user = await this.hospitalModel.findOne({ mobile })
        if (user) role = UserRole.HOSPITAL
      }
      if (!user) {
        user = await this.patientModel.findOne({ mobile })
        if (user) role = UserRole.PATIENT
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

      // 6️⃣ Ensure Sub-Roles Can Log in as Organizer
      const isOrganizerRole = [UserRole.ORGANIZER_DOCTOR, UserRole.ORGANIZER_STAFF].includes(role as UserRole)
      const finalRole = isOrganizerRole ? UserRole.ORGANIZER : role

      // 7️⃣ Generate JWT Token
      const payload = { _id: user._id, role: finalRole }
      const access_token = this.jwtService.sign(payload)

      // 8️⃣ Remove Sensitive Data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userDetails } = user.toObject ? user.toObject() : user

      return { access_token, userDetails }
    } catch (error) {
      console.error('Login Error:', error.message || error)
      throw new InternalServerErrorException('Login failed, please try again')
    }
  }

  private getModelByRole(role: UserRole) {
    switch (role) {
      case UserRole.ORGANIZER:
      case UserRole.ORGANIZER_DOCTOR:
      case UserRole.ORGANIZER_STAFF:
        return this.organizerModel
      case UserRole.VISIT_DOCTOR:
        return this.visitDoctorModel
      case UserRole.LAB:
        return this.labModel
      case UserRole.HOSPITAL:
        return this.hospitalModel
      case UserRole.PATIENT:
        return this.patientModel
      default:
        return null
    }
  }
}

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
import { MobileValidationService } from 'src/mobile-validation/mobile-validation.service'
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
      let role: UserRole | null = null

      // 🔹 Helper function to check user existence in a collection
      const checkUserInCollection = async (model: any, query: object, userRole: UserRole) => {
        const result = await model.findOne(query)
        if (result) {
          return { user: result, role: userRole }
        }
        return null
      }

      // 🔹 Check user across different collections
      const userChecks = [
        { model: this.organizerModel, query: { mobile }, role: UserRole.ORGANIZER },
        { model: this.visitDoctorModel, query: { mobile }, role: UserRole.VISIT_DOCTOR },
        { model: this.patientModel, query: { mobile }, role: UserRole.PATIENT },
        { model: this.labModel, query: { mobile }, role: UserRole.LAB },
        { model: this.hospitalModel, query: { mobile }, role: UserRole.HOSPITAL },
      ]

      for (const check of userChecks) {
        const result = await checkUserInCollection(check.model, check.query, check.role)
        if (result) {
          user = result.user
          role = result.role
          break
        }
      }

      // 🔹 Check for Doctors & Staff in Organizer's events
      if (!user) {
        const event = await this.organizerModel.findOne({
          $or: [{ 'events.doctors.mobile': mobile }, { 'events.staff.mobile': mobile }],
        })

        if (event) {
          const foundEvent = event.events.find(
            (ev) =>
              ev.doctors.some((doc) => doc.mobile === mobile) || ev.staff.some((staff) => staff.mobile === mobile),
          )

          if (foundEvent) {
            user =
              foundEvent.doctors.find((doc) => doc.mobile === mobile) ||
              foundEvent.staff.find((staff) => staff.mobile === mobile)
            role = user
              ? foundEvent.doctors.includes(user)
                ? UserRole.ORGANIZER_DOCTOR
                : UserRole.ORGANIZER_STAFF
              : null
          }
        }
      }

      // 🔹 Check Staff in VisitDoctor's visitDetails
      if (!user) {
        const visitDoctor = await this.visitDoctorModel.findOne({ 'visitDetails.staff.mobile': mobile })
        if (visitDoctor) {
          const foundVisit = visitDoctor.visitDetails.find((visit) => visit.staff.some((s) => s.mobile === mobile))
          if (foundVisit) {
            user = foundVisit.staff.find((s) => s.mobile === mobile)
            role = UserRole.VISIT_DOCTOR_STAFF
          }
        }
      }

      // 🔹 Check Staff in Lab
      if (!user) {
        const lab = await this.labModel.findOne({ 'staff.mobile': mobile })
        if (lab) {
          user = lab.staff.find((s) => s.mobile === mobile)
          role = UserRole.LAB_STAFF
        }
      }

      // 🔹 Check Doctors & Staff in Hospital
      if (!user) {
        const hospital = await this.hospitalModel.findOne({
          $or: [{ 'staff.mobile': mobile }, { 'doctors.mobile': mobile }],
        })
        if (hospital) {
          user = hospital.staff.find((s) => s.mobile === mobile) || hospital.doctors.find((d) => d.mobile === mobile)
          role = user ? (hospital.staff.includes(user) ? UserRole.HOSPITAL_STAFF : UserRole.HOSPITAL_DOCTOR) : null
        }
      }

      // ❌ If User Not Found, Throw Error
      if (!user) {
        throw new UnauthorizedException('Invalid mobile number or password')
      }

      // 🔹 Verify Password
      const isPasswordMatch = await bcrypt.compare(password, user.password)
      if (!isPasswordMatch) {
        throw new UnauthorizedException('Invalid mobile number or password')
      }

      // 🔹 Normalize Role Mapping
      const roleMapping: Record<UserRole, UserRole> = {
        [UserRole.ORGANIZER]: UserRole.ORGANIZER,
        [UserRole.ORGANIZER_DOCTOR]: UserRole.ORGANIZER,
        [UserRole.ORGANIZER_STAFF]: UserRole.ORGANIZER,
        [UserRole.VISIT_DOCTOR]: UserRole.VISIT_DOCTOR,
        [UserRole.VISIT_DOCTOR_STAFF]: UserRole.VISIT_DOCTOR,
        [UserRole.LAB]: UserRole.LAB,
        [UserRole.LAB_STAFF]: UserRole.LAB,
        [UserRole.HOSPITAL]: UserRole.HOSPITAL,
        [UserRole.HOSPITAL_DOCTOR]: UserRole.HOSPITAL,
        [UserRole.HOSPITAL_STAFF]: UserRole.HOSPITAL,
        [UserRole.PATIENT]: UserRole.PATIENT,
      }

      const finalRole = roleMapping[role as UserRole] || role

      // 🔹 Generate JWT Token
      const payload = { _id: user._id, role: finalRole }
      const access_token = this.jwtService.sign(payload)

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
      case UserRole.VISIT_DOCTOR_STAFF:
        return this.visitDoctorModel
      case UserRole.LAB:
      case UserRole.LAB_STAFF:
        return this.labModel
      case UserRole.HOSPITAL:
      case UserRole.HOSPITAL_DOCTOR:
      case UserRole.HOSPITAL_STAFF:
        return this.hospitalModel
      case UserRole.PATIENT:
        return this.patientModel
      default:
        return null
    }
  }
}

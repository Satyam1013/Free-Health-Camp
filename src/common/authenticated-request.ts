import { Request as ExpressRequest } from 'express'
import { Types } from 'mongoose'
import { UserRole } from 'src/auth/create-user.dto'

export interface AuthenticatedRequest extends ExpressRequest {
  user: {
    _id: Types.ObjectId
    role?: UserRole
  }
}

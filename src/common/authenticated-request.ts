import { Request as ExpressRequest } from 'express'
import { Types } from 'mongoose'
import { UserRole } from './common.types'

export interface AuthenticatedRequest extends ExpressRequest {
  user: {
    _id: Types.ObjectId
    role?: UserRole
  }
}

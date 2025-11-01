import { ObjectId } from "mongodb"
import { Request } from "express";

export interface JwtPayload {
  name: string
  id: string
  iat: number
  exp: number
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export interface MulterRequest extends Request {
  file: Express.Multer.File;
}

export interface User {
  _id?: ObjectId
  avatar: Base64URLString
  name: string
  passwd_hash:string
}

export interface Post {
  _id?: ObjectId
  user: JwtPayload
  content: string
  createdAt: Date
  likes?: ObjectId[]
  favorites?: ObjectId[]
}

export interface Comment extends Post {
  FatherType: "Post" | "Comment"
  Father_ptr: ObjectId
  createdAt: Date
  has_subComment: Boolean
}

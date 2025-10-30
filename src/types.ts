import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  avatar: Base64URLString;
  name: string;
  passwd_hash:string;
}

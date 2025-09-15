import { IUser } from "../types/user.types";
import UserModel from "../models/user.models";


// export class UserService{

//     static async findByEmail(email: string){
//         return await UserModel.findOne({email})
//     }

//     static async createUser(data: IUser){
//         return await UserModel.create(data)
//     }
// }


export const findByEmail = async (email: string) => {
    return await UserModel.findOne({email})
}

export const createUser = async (data: IUser) => {
    return await UserModel.create(data)
}
import OtpModel from "../models/otp.models";
import { IOtp } from "../types/otp.types";

export const createOtp = async (otp: IOtp) => {
    return await OtpModel.create(otp)
}

export const findOtp = async (email: string, otp: string) => {
    return await OtpModel.find({email, otp})
}

export const deleteOtp = async (email: string) => {
    return await OtpModel.deleteOne({email})
}
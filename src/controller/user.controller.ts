import { Request, Response } from "express";
import otpgenerator from 'otp-generator';

import { findByEmail, createUser } from "../service/user.service";


// export class UserController{
//     static async registerUser(req: Request, res: Response){
//         try{
//             console.log(req.body);
//             const {email} = req.body;
//             const existingUser = await UserService.findByEmail(email)
//             if(existingUser){
//                 throw new Error("User already existing")
//             }
//             res.status(200).json({message: "Successfully registered the user"})
//         }catch(error){
//             res.status(401).json({message: "Failed to register the user"})
//         }
//     }
// }


const registerUser = async (req: Request, res: Response) : Promise <void> => {
    try{
          console.log(req.body);
            const {email} = req.body;
            const existingUser = await findByEmail(email)
            if(existingUser){
                throw new Error("User already existing")
            }
            const otpCode = otpgenerator.generate(6, {
                digits: true,
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            })
            console.log("Otp testing ", otpCode)
            res.status(200).json({message: "Successfully registered the user"})
    }catch(error){
        res.status(401).json({message: "Failed to register the user"})
    }
}


export {registerUser}
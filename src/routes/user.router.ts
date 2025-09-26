import express from 'express';
import { deleteAvatar, loginUser, logoutUser, refreshAccessToken, registerUser , registerVerifiedUser, resendOtp, updateUserProfile, verifyOtpAndUser} from '../controller/user.controller';
import { isAuth } from '../middleware/isAuth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtpAndUser);
router.post("/resend-otp", resendOtp);
router.post("/register-verified-user", registerVerifiedUser);
router.post("/login-user", loginUser)
router.post("/refresh-token", refreshAccessToken);
router.post("/logout-user", logoutUser);
router.put("/update-profile", isAuth, upload.fields([{ name: 'avatar', maxCount: 1 }]), updateUserProfile)
router.delete("/delete-avatar", isAuth, deleteAvatar)


export default router;
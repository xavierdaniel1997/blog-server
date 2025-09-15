import express from 'express';
import userRouter from "./user.router";

const router = express.Router();

router.use("/auth", userRouter);

export default router;
import express from 'express';
import userRouter from "./user.router";
import topicRoute from './topic.route';

const router = express.Router();

router.use("/auth", userRouter);
router.use("/blog", topicRoute)

export default router;
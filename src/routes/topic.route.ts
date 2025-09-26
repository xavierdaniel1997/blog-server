import express from 'express';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { createTopic, deleteTopic, getAllTopics, updateTopic } from '../controller/topic.controller';

const route = express.Router();

route.post("/create-topic", isAuth, createTopic);
route.get("/get-all-topics", isAuth, getAllTopics);
route.put("/update-topic/:id", isAuth, isAdmin, updateTopic);
route.delete("/delete-topic/:id", isAuth, isAdmin, deleteTopic);

export default route;
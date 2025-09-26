import { Request, Response } from "express";
import {
  allTopics,
  createNewTopic,
  deleteTopicById,
  singleTopic,
  updateTopicById,
} from "../service/topic.service";
import { ITopic } from "../types/topic.types";
import { error } from "console";

const createTopic = async (req: Request, res: Response) => {
  try {
    const { topic, description } = req.body;
    const user = req.user;
    if (!user) {
      throw new Error("Not a valid user");
    }
    const existingTopic = await singleTopic(topic);
    if (existingTopic) {
      throw new Error("This topic is already existing");
    }
    const newTopicData: ITopic = {
      topic,
      description,
    };
    const newTopic = await createNewTopic(newTopicData);
    res
      .status(200)
      .json({ message: "Successfully create the topic", topic: newTopic });
  } catch (error: any) {
    res
      .status(401)
      .json({ error: error.message, message: "Failed to create the topic" });
  }
};

const getAllTopics = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("Not a valid user");
    }
    const serach = req.query.topic as string | undefined;
    const topics = await allTopics(serach);
    if (!topics) {
      throw new Error("Empty topic lists");
    }
    res
      .status(200)
      .json({ message: "Successfully fetch the topics", topics: topics });
  } catch (error: any) {
    res
      .status(401)
      .json({
        error: error.message,
        message: "Failed to fetch the topic datas",
      });
  }
};

const updateTopic = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("Not a valid user");
    }
    const { id } = req.params;
    const { topic, description } = req.body;
    if (!id) {
      throw new Error("topic id is missing");
    }
    const existingTopic = await singleTopic(topic);
    if (existingTopic) {
      throw new Error("This topic is already existing");
    }
    const updateTopics: Partial<ITopic> = {};
    if (topic) updateTopics.topic = topic;
    if (description) updateTopics.description = description;
    const updatedData = await updateTopicById(id, updateTopics);
    res
      .status(200)
      .json({ message: "Successfully update the topics", topic: updatedData });
  } catch (error: any) {
    res
      .status(401)
      .json({
        error: error.message,
        message: "Failed to update the topic datas",
      });
  }
};

const deleteTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("Not a valid user");
    }
    const { id } = req.params;
    if (!id) {
      throw new Error("topic id is missing");
    }
    await deleteTopicById(id)
    res.status(200).json({ message: "Successfully delete the topic"});
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message, message: "Failed to delete the topic" });
  }
};

export { createTopic, getAllTopics, updateTopic, deleteTopic };

import TopicModel from "../models/topic.models";
import { ITopic } from "../types/topic.types";


export const createNewTopic = async (data: ITopic) : Promise<ITopic> => {
    return await TopicModel.create(data)
}

export const singleTopic = async(topic: string) : Promise<ITopic | null> => {
    return await TopicModel.findOne({topic})
}

export const allTopics = async (search?: string) : Promise<ITopic[] | null> => {
    if(search && search.trim() !== ""){
        return await TopicModel.find({
            topic: {$regex: search, $options: "i"}
        })
    }
    return await TopicModel.find()
}

export const updateTopicById = async (id: string, data: Partial<ITopic>) => {
    return await TopicModel.findByIdAndUpdate(id, data, {new: true})
}

export const deleteTopicById = async (id: string): Promise<void> => {
    await TopicModel.findByIdAndDelete(id)
}
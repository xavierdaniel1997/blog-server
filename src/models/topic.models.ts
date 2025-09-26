import mongoose, {Schema, model} from "mongoose";
import { ITopic } from "../types/topic.types";

const topicSchema = new Schema<ITopic>({
    topic: {
        type: String,
    },
    description: {
        type: String,
    }
}, 
{
    timestamps: true
})

const TopicModel = model('Topic', topicSchema);
export default TopicModel;
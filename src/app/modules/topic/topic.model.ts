import mongoose, { Document, Schema } from "mongoose";
import Counter from "../core.model";
export interface ITopic extends Document {
    _id: mongoose.Types.ObjectId;
    TopicId: number;
    title: string;
    route: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
    {
        TopicId: {
            type: Number,
            unique: true,
            index: true,
        },

        title: { type: String, required: true, trim: true },

        route: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        isActive: {
            type: Boolean,
            default: true
        }

    },
    {
        collection: "topics",
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

TopicSchema.pre<ITopic>("save", async function () {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: "TopicId" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        this.TopicId = counter.seq;
    }
});
const TopicModel = mongoose.model<ITopic>("Topic", TopicSchema);
export default TopicModel;

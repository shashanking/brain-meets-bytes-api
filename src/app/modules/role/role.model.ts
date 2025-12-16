import mongoose, { Document, Schema } from "mongoose";
import Counter from "../core.model";
export interface IRole extends Document {
    _id: mongoose.Types.ObjectId;
    RoleId: number;
    Rolename: string;
    description: string,
    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
    {
        RoleId: {
            type: Number,
            unique: true,
            index: true,
        },

        Rolename: { type: String, required: true, trim: true },
        description: { type: String, trim: true },

    },
    {
        collection: "Roles",
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

RoleSchema.pre<IRole>("save", async function () {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: "RoleId" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        this.RoleId = counter.seq;
    }
});
const RoleModel = mongoose.model<IRole>("Role", RoleSchema);
export default RoleModel;

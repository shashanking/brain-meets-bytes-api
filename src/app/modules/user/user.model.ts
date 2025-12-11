import mongoose, { Document, Schema } from "mongoose";
import Counter from "../core.model";
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    userId: number;
    name: string;
    email: string;
    password?: string;
    role?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        userId: {
            type: Number,
            unique: true,
            index: true,
        },

        name: { type: String, required: true, trim: true },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        password: { type: String },

        role: { type: String, default: "user" },
    },
    {
        collection: "users",
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

UserSchema.pre<IUser>("save", async function () {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: "userId" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        this.userId = counter.seq;
    }
});
const UserModel = mongoose.model<IUser>("user", UserSchema);
export default UserModel;

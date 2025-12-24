import mongoose, { Document, Schema } from "mongoose";
import Counter from "../core.model";

/* =========================
   MEMBERSHIP PLAN
========================= */

export interface IMembership extends Document {
  _id: mongoose.Types.ObjectId;
  MembershipId: number;          // auto-increment
  name: string;                  // BASIC | PRO | PREMIUM
  price: number;
  durationInDays: number;
  earlyAccess: boolean;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    MembershipId: {
      type: Number,
      unique: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    price: {
      type: Number,
      required: true,
    },

    durationInDays: {
      type: Number,
      required: true,
      unique: true,
    },

    earlyAccess: {
      type: Boolean,
      default: false
    },

    features: {
      type: [String],
      default: []
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: "memberships",
    timestamps: true
  }
);

/* =========================
   AUTO INCREMENT
========================= */

MembershipSchema.pre<IMembership>("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "MembershipId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.MembershipId = counter.seq;
  }
});

const MembershipModel = mongoose.model<IMembership>(
  "memberships",
  MembershipSchema
);

export default MembershipModel;

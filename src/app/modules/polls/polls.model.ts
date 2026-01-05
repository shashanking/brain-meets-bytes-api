import mongoose, { Document, Schema } from "mongoose";
import Counter from "../core.model";

//POLL
export interface IPoll extends Document {
  PollId: number;
  title: string;
  description?: string;
  userId: number;
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const PollSchema = new Schema<IPoll>({
  PollId: { type: Number, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  userId: { type: Number, required: true, index: true },
  totalVotes: { type: Number, default: 0 }
}, { timestamps: true });

PollSchema.pre<IPoll>("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "PollId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.PollId = counter.seq;
  }
});

export const PollModel = mongoose.model<IPoll>("Poll", PollSchema);

/* =========================
   POLL OPTION
========================= */
export interface IPollOption extends Document {
  OptionId: number;
  PollId: number;
  text: string;
  voteCount: number;
}

const PollOptionSchema = new Schema<IPollOption>({
  OptionId: { type: Number, unique: true, index: true },
  PollId: { type: Number, required: true, index: true },
  text: { type: String, required: true },
  voteCount: { type: Number, default: 0 }
}, { timestamps: true });

PollOptionSchema.pre<IPollOption>("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "PollOptionId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.OptionId = counter.seq;
  }
});

// PollOptionSchema.pre("insertMany", async function (next, docs: any[]) {
//   try {
//     for (const doc of docs) {
//       if (!doc.OptionId) {
//         const counter = await Counter.findByIdAndUpdate(
//           { _id: "PollOptionId" },
//           { $inc: { seq: 1 } },
//           { new: true, upsert: true }
//         );
//         doc.OptionId = counter.seq;
//       }
//     }
//     next();
//   } catch (err) {
//     next(err as any);
//   }
// });

export const PollOptionModel =
  mongoose.model<IPollOption>("PollOption", PollOptionSchema);

export interface IPollVote extends Document {
  PollId: number;
  OptionId: number;
  userId: number;
}

const PollVoteSchema = new Schema<IPollVote>({
  PollId: { type: Number, required: true, index: true },
  OptionId: { type: Number, required: true },
  userId: { type: Number, required: true }
}, { timestamps: true });

PollVoteSchema.index(
  { PollId: 1, userId: 1 },
  { unique: true }
);

export const PollVoteModel =
  mongoose.model<IPollVote>("PollVote", PollVoteSchema);

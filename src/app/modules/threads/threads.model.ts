import mongoose, { Document, Schema } from "mongoose";
import Counter from "../core.model";

export interface IThread extends Document {
  ThreadId: number;
  title: string;
  content: string;
  CategoryId: number[];
  images?: string[];
  videos?: string[]
  userId: number;
  likes: number;
  commentsCount: number;
  reportsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ThreadSchema = new Schema<IThread>(
  {
    ThreadId: { type: Number, unique: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    CategoryId: { type: [Number], index: true },
    images: [String],
    videos: [String],
    userId: { type: Number, required: true, index: true },
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    reportsCount: { type: Number, default: 0 }

  },
  { timestamps: true }
);

ThreadSchema.pre<IThread>("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "ThreadId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.ThreadId = counter.seq;
  }
});


export interface IThreadLike extends Document {
  ThreadId: number;
  userId: number;
  createdAt: Date;
}

const ThreadLikeSchema = new Schema<IThreadLike>(
  {
    ThreadId: { type: Number, required: true, index: true },
    userId: { type: Number, required: true }
  },
  { timestamps: true }
);

ThreadLikeSchema.index(
  { ThreadId: 1, userId: 1 },
  { unique: true }
);

export interface IThreadComment extends Document {
  CommentId: number;
  ThreadId: number;
  userId: number;
  comments: string;
  parentCommentId?: number;
  level: number;
  likes: number;
  createdAt: Date;
}

const ThreadCommentSchema = new Schema<IThreadComment>(
  {
    CommentId: { type: Number, unique: true },
    ThreadId: { type: Number, required: true, index: true },
    userId: { type: Number, required: true },
    comments: { type: String, required: true },
    parentCommentId: { type: Number, default: null },
    level: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

ThreadCommentSchema.pre<IThreadComment>("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "CommentId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.CommentId = counter.seq;
  }
});

export interface ICommentLike extends Document {
  CommentId: number;
  ThreadId: number;
  userId: number;
  createdAt: Date;
}

const CommentLikeSchema = new Schema<ICommentLike>(
  {
    CommentId: { type: Number, required: true, index: true },
    ThreadId: { type: Number, required: true, index: true },
    userId: { type: Number, required: true }
  },
  { timestamps: true }
);

CommentLikeSchema.index(
  { CommentId: 1, userId: 1 },
  { unique: true }
);

export interface IThreadReport extends Document {
  ThreadId: number;
  userId: number;
  reason: string;
}

const ThreadReportSchema = new Schema<IThreadReport>(
  {
    ThreadId: { type: Number, required: true, index: true },
    userId: { type: Number, required: true },
    reason: { type: String, required: true, maxlength: 500 }
  },
  { timestamps: true }
);

ThreadReportSchema.index({ ThreadId: 1, userId: 1 }, { unique: true });

export interface ISavedThread extends Document {
  ThreadId: number;
  userId: number;
  createdAt: Date;
}

const SavedThreadSchema = new Schema<ISavedThread>(
  {
    ThreadId: { type: Number, required: true, index: true },
    userId: { type: Number, required: true, index: true }
  },
  { timestamps: true }
);

SavedThreadSchema.index({ ThreadId: 1, userId: 1 }, { unique: true });

export const ThreadModel = mongoose.model<IThread>(
  "Threads",
  ThreadSchema
);

export const ThreadLikeModel = mongoose.model<IThreadLike>(
  "ThreadLike",
  ThreadLikeSchema
);

export const ThreadCommentModel = mongoose.model<IThreadComment>(
  "ThreadComment",
  ThreadCommentSchema
);

export const CommentLikeModel = mongoose.model<ICommentLike>(
  "CommentLike",
  CommentLikeSchema
);

export const ThreadReportModel = mongoose.model<IThreadReport>("ThreadReports", ThreadReportSchema);

export const SavedThreadModel = mongoose.model<ISavedThread>(
  "SavedThreads",
  SavedThreadSchema
);
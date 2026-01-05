import mongoose, { Document, Schema } from "mongoose";
import Counter from "../core.model";


export interface IPodcast extends Document {
  PodcastId: number;
  sanityPodcastId: string;
  name: string;

  likeCount: number;
  dislikeCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const PodcastSchema = new Schema<IPodcast>(
  {
    PodcastId: { type: Number, unique: true, index: true },

    sanityPodcastId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      required: true
    },

    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

PodcastSchema.pre<IPodcast>("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "PodcastId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.PodcastId = counter.seq;
  }
});

export const PodcastModel = mongoose.model<IPodcast>(
  "Podcast",
  PodcastSchema
);

export interface IPodcastReaction extends Document {
  PodcastId: number;
  sanityPodcastId: string;
  userId: number;
  reaction: "like" | "dislike";
}

const PodcastReactionSchema = new Schema<IPodcastReaction>(
  {
    PodcastId: { type: Number, required: true, index: true },

    sanityPodcastId: {
      type: String,
      required: true,
      index: true
    },

    userId: { type: Number, required: true },

    reaction: {
      type: String,
      enum: ["like", "dislike"],
      required: true
    }
  },
  { timestamps: true }
);

PodcastReactionSchema.index(
  { PodcastId: 1, userId: 1 },
  { unique: true }
);

export const PodcastReactionModel = mongoose.model<IPodcastReaction>(
  "PodcastReaction",
  PodcastReactionSchema
);

export interface IPodcastComment extends Document {
  CommentId: number;
  sanityPodcastId: string;
  PodcastId: number;

  userId: number;
  comment: string;

  parentCommentId?: number | null;
  level: number;

  likeCount: number;
  dislikeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PodcastCommentSchema = new Schema<IPodcastComment>(
  {
    CommentId: { type: Number, unique: true, index: true },

    sanityPodcastId: {
      type: String,
      required: true,
      index: true
    },

    PodcastId: {
      type: Number,
      required: true,
      index: true
    },

    userId: {
      type: Number,
      required: true,
      index: true
    },

    comment: {
      type: String,
      required: true
    },

    parentCommentId: {
      type: Number,
      default: null,
      index: true
    },

    level: {
      type: Number,
      default: 0
    },

    likeCount: {
      type: Number,
      default: 0
    },

    dislikeCount: {
      type: Number,
      default: 0
    }

  },
  { timestamps: true }
);

PodcastCommentSchema.pre<IPodcastComment>("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "PodcastCommentId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.CommentId = counter.seq;
  }
});

export const PodcastCommentModel = mongoose.model<IPodcastComment>(
  "PodcastComment",
  PodcastCommentSchema
);

export interface IPodcastCommentLike extends Document {
  CommentId: number;
  PodcastId: number;
  sanityPodcastId: string;
  userId: number;
}

const PodcastCommentLikeSchema = new Schema<IPodcastCommentLike>(
  {
    CommentId: { type: Number, required: true, index: true },

    // PodcastId: { type: Number, required: true, index: true },

    // sanityPodcastId: {
    //   type: String,
    //   required: true,
    //   index: true
    // },

    userId: { type: Number, required: true }
  },
  { timestamps: true }
);
PodcastCommentLikeSchema.index(
  { CommentId: 1, userId: 1 },
  { unique: true }
);

export const PodcastCommentLikeModel =
  mongoose.model<IPodcastCommentLike>(
    "PodcastCommentLike",
    PodcastCommentLikeSchema
  );

export interface ISavedPodcast extends Document {
  PodcastId: number;
  userId: number;
  createdAt: Date;
}

const SavedPodcastSchema = new Schema<ISavedPodcast>(
  {
    PodcastId: { type: Number, required: true, index: true },
    userId: { type: Number, required: true, index: true }
  },
  { timestamps: true }
);

SavedPodcastSchema.index({ PodcastId: 1, userId: 1 }, { unique: true });

export const SavedPodcastModel = mongoose.model<ISavedPodcast>(
  "SavedPodcasts",
  SavedPodcastSchema
);
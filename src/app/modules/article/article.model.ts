import mongoose, { Document, Schema } from "mongoose";
import Counter from "../core.model";


export interface IArticle extends Document {
  ArticleId: number;
  sanityArticleId: string;
  name: string;

  likeCount: number;
  dislikeCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    ArticleId: { type: Number, unique: true, index: true },

    sanityArticleId: {
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

ArticleSchema.pre<IArticle>("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "ArticleId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.ArticleId = counter.seq;
  }
});

export const ArticleModel = mongoose.model<IArticle>(
  "Article",
  ArticleSchema
);

export interface IArticleReaction extends Document {
  ArticleId: number;
  sanityArticleId: string;
  userId: number;
  reaction: "like" | "dislike";
}

const ArticleReactionSchema = new Schema<IArticleReaction>(
  {
    ArticleId: { type: Number, required: true, index: true },

    sanityArticleId: {
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

ArticleReactionSchema.index(
  { ArticleId: 1, userId: 1 },
  { unique: true }
);

export const ArticleReactionModel = mongoose.model<IArticleReaction>(
  "ArticleReaction",
  ArticleReactionSchema
);

export interface IArticleComment extends Document {
  CommentId: number;
  sanityArticleId: string;
  ArticleId: number;

  userId: number;
  comment: string;

  parentCommentId?: number | null;
  level: number;

  likeCount: number;
  dislikeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleCommentSchema = new Schema<IArticleComment>(
  {
    CommentId: { type: Number, unique: true, index: true },

    sanityArticleId: {
      type: String,
      required: true,
      index: true
    },

    ArticleId: {
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

ArticleCommentSchema.pre<IArticleComment>("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "ArticleCommentId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.CommentId = counter.seq;
  }
});

export const ArticleCommentModel = mongoose.model<IArticleComment>(
  "ArticleComment",
  ArticleCommentSchema
);

export interface IArticleCommentLike extends Document {
  CommentId: number;
  ArticleId: number;
  sanityArticleId: string;
  userId: number;
}

const ArticleCommentLikeSchema = new Schema<IArticleCommentLike>(
  {
    CommentId: { type: Number, required: true, index: true },

    // ArticleId: { type: Number, required: true, index: true },

    // sanityArticleId: {
    //   type: String,
    //   required: true,
    //   index: true
    // },

    userId: { type: Number, required: true }
  },
  { timestamps: true }
);

ArticleCommentLikeSchema.index(
  { CommentId: 1, userId: 1 },
  { unique: true }
);

export const ArticleCommentLikeModel =
  mongoose.model<IArticleCommentLike>(
    "ArticleCommentLike",
    ArticleCommentLikeSchema
  );
  
export interface ISavedArticle extends Document {
  sanityArticleId: string;
  userId: number;
  createdAt: Date;
}

const SavedArticleSchema = new Schema<ISavedArticle>(
  {
    sanityArticleId: { type: String, required: true, index: true },
    userId: { type: Number, required: true, index: true }
  },
  { timestamps: true }
);

SavedArticleSchema.index(
  { sanityArticleId: 1, userId: 1 },
  { unique: true }
);

export const SavedArticleModel = mongoose.model<ISavedArticle>(
  "SavedArticles",
  SavedArticleSchema
);
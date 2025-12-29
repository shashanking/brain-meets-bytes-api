import mongoose, { Document, Schema } from "mongoose";
import Counter from "../core.model";

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  CategoryId: number;
  title: string;
  route: string;
  description?: string;
  image?: string
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    CategoryId: {
      type: Number,
      unique: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    route: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    description: {
      type: String,
      trim: true
    },
    
    image: {
      type: String,
    },

    color: {
      type: String
    }
  },
  {
    collection: "Categories",
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

CategorySchema.pre<ICategory>("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "CategoryId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.CategoryId = counter.seq;
  }
});

const CategoryModel = mongoose.model<ICategory>(
  "Category",
  CategorySchema
);

export default CategoryModel;

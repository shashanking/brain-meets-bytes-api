import mongoose from "mongoose";
import CategoryModel, { ICategory } from "./category.model";

const tryNumber = (val: any) => {
    if (typeof val !== "string") return val;
    if (/^\d+$/.test(val)) return Number(val);
    return val;
};

class CategoryService {

    async findByRoute(route: string): Promise<ICategory | null> {
        return CategoryModel.findOne({ route }).exec();
    }

    async createCategory(payload: Partial<ICategory>) {
        try {
            const category = new CategoryModel(payload);
            const result = await category.save();
            return {
                status: true,
                message: "Category created",
                data: result
            };
        } catch (error: any) {
            return {
                status: false,
                message: error.message,
                data: []
            };
        }
    }

    async updateCategory(CategoryId: any, payload: Partial<ICategory>) {
        try {
            const updated = await CategoryModel.findOneAndUpdate(
                { CategoryId: tryNumber(CategoryId) },
                { $set: payload },
                { new: true, runValidators: true }
            ).lean();

            if (!updated) {
                return {
                    status: false,
                    message: "Category not found",
                    data: []
                };
            }
            return {
                status: true,
                message: "Category updated",
                data: updated
            };
        } catch (error: any) {
            return {
                status: false,
                message: error.message,
                data: []
            };
        }
    }

    async deleteCategory(CategoryId: any) {
        try {
            const deleted = await CategoryModel.findOneAndDelete({
                CategoryId: tryNumber(CategoryId)
            }).lean();

            if (!deleted) {
                return {
                    status: false,
                    message: "Category not found",
                    data: []
                };
            }
            return {
                status: true,
                message: "Category deleted",
                data: deleted
            };
        } catch (error: any) {
            return {
                status: false,
                message: error.message,
                data: []
            };
        }
    }

    async getCategories(query: any) {
        try {
            const {
                page = 1,
                limit = 10,
                search
            } = query;

            const pageNum = Number(page);
            const limitNum = Number(limit);
            const skip = (pageNum - 1) * limitNum;

            let filter: any = {};

            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: "i" } },
                    { slug: { $regex: search, $options: "i" } }
                ];
            }

            const total = await CategoryModel.countDocuments(filter);

            const data = await CategoryModel.find(filter)
                .sort({ CategoryId: 1 })
                .skip(skip)
                .limit(limitNum)
                .lean();

            return {
                status: true,
                message: "Categories fetched",
                meta: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum)
                },
                data
            };
        } catch (error: any) {
            return {
                status: false,
                message: error.message,
                data: []
            };
        }
    }

    async getCategoryById(CategoryId: string) {
        try {
            let query: any = {};

            if (mongoose.Types.ObjectId.isValid(CategoryId)) {
                query._id = CategoryId;
            } else {
                query.CategoryId = tryNumber(CategoryId);
            }

            const category = await CategoryModel.findOne(query).lean();

            if (!category) {
                return {
                    status: false,
                    message: "Category not found",
                    data: []
                };
            }

            return {
                status: true,
                message: "Category fetched",
                data: category
            };
        } catch (error: any) {
            return {
                status: false,
                message: error.message,
                data: []
            };
        }
    }
}

export const categoryService = new CategoryService();

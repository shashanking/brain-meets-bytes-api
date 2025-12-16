import { Request, Response } from "express";
import { categoryService } from "./category.services";

class CategoryController {

    async createCategory(req: Request, res: Response) {
        const payload = {
            title: req.body.title,
            route: req.body.route,
            description: req.body.description,
            color: req.body.color
        };
        if (!payload.title) {
            return res.status(400).send({ message: "Category Categoryname is required" });
        }

        const existing: any = await categoryService.findByRoute(payload.route);
        if (existing) {
            return res.status(409).send({
                message: "Route already exists"
            });
        }

        const result = await categoryService.createCategory(payload);
        return res.status(201).send(result);
    }

    async updateCategory(req: Request, res: Response) {
        const CategoryId = req.query.CategoryId;

        if (!CategoryId) {
            return res.status(400).send({ message: "CategoryId is required" });
        }

        const result = await categoryService.updateCategory(CategoryId, req.body);
        return res.status(result.status ? 200 : 404).send(result);
    }

    async deleteCategory(req: Request, res: Response) {
        const CategoryId = req.query.CategoryId;

        if (!CategoryId) {
            return res.status(400).send({ message: "CategoryId is required" });
        }

        const result = await categoryService.deleteCategory(CategoryId);
        return res.status(result.status ? 200 : 404).send(result);
    }

    async getCategorys(req: Request, res: Response) {
        const result = await categoryService.getCategories(req.query);
        return res.status(200).send(result);
    }

    async getCategory(req: Request, res: Response) {
        const CategoryId = String(req.query.CategoryId || "");

        if (!CategoryId) {
            return res.status(400).send({ message: "CategoryId is required" });
        }

        const result = await categoryService.getCategoryById(CategoryId);
        return res.status(result.status ? 200 : 404).send(result);
    }
}

export const categoryController = new CategoryController();

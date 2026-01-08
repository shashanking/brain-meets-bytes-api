import { Router } from "express";
import { categoryController } from "./category.controller";
import { adminOnly } from "../helper/auth.middleware";

const router = Router();

router.post("/", adminOnly, categoryController.createCategory.bind(categoryController));
router.put("/", adminOnly, categoryController.updateCategory.bind(categoryController));
router.delete("/", adminOnly, categoryController.deleteCategory.bind(categoryController));
router.get("/", categoryController.getCategorys.bind(categoryController));
router.get("/one", categoryController.getCategory.bind(categoryController));

export default router;

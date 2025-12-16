import { Router } from "express";
import { categoryController } from "./category.controller";

const router = Router();

router.post("/", categoryController.createCategory.bind(categoryController));
router.put("/", categoryController.updateCategory.bind(categoryController));
router.delete("/", categoryController.deleteCategory.bind(categoryController));
router.get("/", categoryController.getCategorys.bind(categoryController));
router.get("/one", categoryController.getCategory.bind(categoryController));

export default router;

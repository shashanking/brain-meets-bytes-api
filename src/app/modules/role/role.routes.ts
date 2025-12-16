import { Router } from "express";
import { roleController } from "./role.controller";

const router = Router();

router.post("/", roleController.createRole.bind(roleController));
router.put("/", roleController.updateRole.bind(roleController));
router.delete("/", roleController.deleteRole.bind(roleController));
router.get("/", roleController.getRoles.bind(roleController));
router.get("/one", roleController.getRole.bind(roleController));

export default router;

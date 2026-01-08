import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.post("/", userController.createUser.bind(userController));
router.put("/", userController.updateUser.bind(userController));
router.delete("/", userController.deleteUser.bind(userController));
router.get("/", userController.getUsers.bind(userController));
router.get("/one", userController.getUser.bind(userController));
router.post("/forgotPassword", userController.forgotPassword.bind(userController));

export default router;

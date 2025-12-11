// user.routes.ts
import { Router } from "express";
import {
    createUser,
    deleteUser,
    getUser,
    getUsers,
    updateUser,
} from "./user.controller";

const router = Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/one", getUser);
router.put("/", updateUser);
router.delete("/", deleteUser);

export default router;

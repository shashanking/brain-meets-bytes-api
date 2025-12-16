import { Request, Response } from "express";
import { roleService } from "./role.services";

class RoleController {

    async createRole(req: Request, res: Response) {
        const { Rolename, description } = req.body;

        if (!Rolename) {
            return res.status(400).send({ message: "Role Rolename is required" });
        }

        const result = await roleService.createRole({ Rolename, description });
        return res.status(201).send(result);
    }

    async updateRole(req: Request, res: Response) {
        const RoleId = req.query.RoleId;

        if (!RoleId) {
            return res.status(400).send({ message: "RoleId is required" });
        }

        const result = await roleService.updateRole(RoleId, req.body);
        return res.status(result.status ? 200 : 404).send(result);
    }

    async deleteRole(req: Request, res: Response) {
        const RoleId = req.query.RoleId;

        if (!RoleId) {
            return res.status(400).send({ message: "RoleId is required" });
        }

        const result = await roleService.deleteRole(RoleId);
        return res.status(result.status ? 200 : 404).send(result);
    }

    async getRoles(req: Request, res: Response) {
        const result = await roleService.getRoles(req.query);
        return res.status(200).send(result);
    }

    async getRole(req: Request, res: Response) {
        const RoleId = String(req.query.RoleId || "");

        if (!RoleId) {
            return res.status(400).send({ message: "RoleId is required" });
        }

        const result = await roleService.getRoleById(RoleId);
        return res.status(result.status ? 200 : 404).send(result);
    }
}

export const roleController = new RoleController();

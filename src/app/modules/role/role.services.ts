import mongoose from "mongoose";
import RoleModel, { IRole } from "./role.model";

const tryNumber = (val: any) => {
    if (typeof val !== "string") return val;
    if (/^\d+$/.test(val)) return Number(val);
    return val;
};

class RoleService {

    async createRole(payload: any) {
        try {
            const role = new RoleModel(payload);
            const result = await role.save();

            return {
                status: true,
                message: "Role created",
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

    async updateRole(RoleId: any, payload: any) {
        try {
            const updated = await RoleModel.findOneAndUpdate(
                { RoleId: tryNumber(RoleId) },
                { $set: payload },
                { new: true, runValidators: true }
            ).lean();

            if (!updated) {
                return { status: false, message: "Role not found", data: [] };
            }

            return { status: true, message: "Role updated", data: updated };
        } catch (error: any) {
            return { status: false, message: error.message, data: [] };
        }
    }

    async deleteRole(RoleId: any) {
        try {
            const deleted = await RoleModel.findOneAndDelete({
                RoleId: tryNumber(RoleId)
            }).lean();

            if (!deleted) {
                return { status: false, message: "Role not found", data: [] };
            }

            return { status: true, message: "Role deleted", data: deleted };
        } catch (error: any) {
            return { status: false, message: error.message, data: [] };
        }
    }

    async getRoles(query: any) {
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
                filter.name = { $regex: search, $options: "i" };
            }

            const total = await RoleModel.countDocuments(filter);
            const data = await RoleModel.find(filter)
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 })
                .lean();

            return {
                status: true,
                message: "Roles fetched",
                meta: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum)
                },
                data
            };
        } catch (error: any) {
            return { status: false, message: error.message, data: [] };
        }
    }

    async getRoleById(RoleId: string) {
        try {
            let query: any = {};

            if (mongoose.Types.ObjectId.isValid(RoleId)) {
                query._id = RoleId;
            } else {
                query.RoleId = tryNumber(RoleId);
            }

            const role = await RoleModel.findOne(query).lean();

            if (!role) {
                return { status: false, message: "Role not found", data: [] };
            }

            return { status: true, message: "Role fetched", data: role };
        } catch (error: any) {
            return { status: false, message: error.message, data: [] };
        }
    }
}

export const roleService = new RoleService();

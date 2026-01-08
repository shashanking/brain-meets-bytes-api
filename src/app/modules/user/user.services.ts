import mongoose from "mongoose";
import UserModel, { IUser } from "./user.model";

const tryNumber = (val: any) => {
    if (typeof val !== "string") return val;
    if (/^\d+$/.test(val)) return Number(val);
    if (/^\d+\.\d+$/.test(val)) return Number(val);
    return val;
};

class UserService {

    async findByEmail(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email }).exec();
    }

    async saveUserValues(payload: any) {
        try {
            const userPayload = new UserModel(payload);
            const result = await userPayload.save();

            if (result) {
                return {
                    status: true,
                    message: "User created",
                    data: result
                };
            }
            return {
                status: false,
                data: [],
                message: "Failed to Save record"
            };
        } catch (error: any) {
            return {
                status: false,
                data: [],
                message: error.message
            };
        }
    }

    async updateUserValues(userId: any, payload: any) {
        try {
            if (userId === undefined || userId === null) {
                return { status: false, data: [], message: "userId is required" };
            }

            const queryUserId =
                typeof userId === "string" && /^\d+$/.test(userId)
                    ? Number(userId)
                    : userId;

            const updated = await UserModel.findOneAndUpdate(
                { userId: queryUserId },
                { $set: payload },
                { new: true, runValidators: true }
            ).lean();

            if (updated) {
                return { status: true, message: "User updated", data: updated };
            }

            return { status: false, data: [], message: "User not found" };

        } catch (error: any) {
            return { status: false, data: [], message: error.message };
        }
    }

    async deleteUserByUserId(userId: any) {
        try {
            if (userId === undefined || userId === null) {
                return { status: false, data: [], message: "userId is required" };
            }

            const queryUserId =
                typeof userId === "string" && /^\d+$/.test(userId)
                    ? Number(userId)
                    : userId;

            const deleted = await UserModel.findOneAndDelete({
                userId: queryUserId
            }).lean();

            if (deleted) {
                return { status: true, message: "User deleted", data: deleted };
            }

            return { status: false, data: [], message: "User not found" };

        } catch (error: any) {
            return { status: false, data: [], message: error.message };
        }
    }

    async getUsers(query: any) {
        try {
            const {
                page = 1,
                limit = 10,
                sort = "-createdAt",
                searchField,
                searchValue,
                filter,
                MembershipId
            } = query;

            const pageNum = Number(page) > 0 ? Number(page) : 1;
            const limitNum = Number(limit) > 0 ? Number(limit) : 10;
            const skip = (pageNum - 1) * limitNum;

            let filterObj: any = {};

            // Parse filter JSON
            if (filter) {
                try {
                    const parsed = typeof filter === "string" ? JSON.parse(filter) : filter;
                    if (parsed && typeof parsed === "object") {
                        Object.keys(parsed).forEach((k) => {
                            filterObj[k] = tryNumber(parsed[k]);
                        });
                    }
                } catch { }
            }

            const reserved = [
                "page",
                "limit",
                "sort",
                "searchField",
                "searchValue",
                "filter",
                "userId",
                "MembershipId"
            ];

            Object.keys(query || {}).forEach((k) => {
                if (reserved.includes(k)) return;
                if (filterObj[k] !== undefined) return;
                filterObj[k] = tryNumber(query[k]);
            });

            // Search
            if (searchField && searchValue) {
                filterObj[searchField] = {
                    $regex: String(searchValue),
                    $options: "i"
                };
            }
            if (MembershipId) {
                filterObj.MembershipId = tryNumber(MembershipId);
            }

            const pipeline: any[] = [
                { $match: filterObj },
                {
                    $lookup: {
                        from: "memberships",
                        localField: "MembershipId",
                        foreignField: "MembershipId",
                        as: "membership"
                    }
                },
                {
                    $addFields: {
                        membership: {
                            $cond: {
                                if: { $eq: ["$hasmembership", true] },
                                then: "$membership",
                                else: []
                            }
                        }
                    }
                },

                {
                    $project: {
                        password: 0
                    }
                },

                {
                    $sort:
                        typeof sort === "string" && sort.startsWith("-")
                            ? { [sort.substring(1)]: -1 }
                            : { [sort]: 1 }
                },

                { $skip: skip },
                { $limit: limitNum }
            ];

            const data = await UserModel.aggregate(pipeline);
            const totalCounts = await UserModel.countDocuments(filterObj);

            return {
                status: true,
                message: "Users fetched",
                meta: {
                    total: totalCounts,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(totalCounts / limitNum) || 0
                },
                data
            };

        } catch (error: any) {
            return {
                status: false,
                data: [],
                message: error.message || "Failed to fetch users"
            };
        }
    }

    async getUserByUserId(userId: string) {
        try {
            if (!userId) {
                return { status: false, data: [], message: "userId is required" };
            }

            let query: any = {};

            if (/^[0-9]+$/.test(userId)) {
                query.userId = Number(userId);
            } else if (mongoose.Types.ObjectId.isValid(userId)) {
                query._id = new mongoose.Types.ObjectId(userId);
            } else {
                query.userId = userId;
            }

            const found = await UserModel.findOne(query).lean();

            if (!found) {
                return { status: false, data: [], message: "User not found" };
            }

            return { status: true, message: "User fetched", data: found };

        } catch (error: any) {
            return {
                status: false,
                data: [],
                message: error.message || "Failed to fetch user"
            };
        }
    }

    async updatePasswordByEmail(email: string, hashedPassword: string) {
    return UserModel.updateOne(
        { email },
        { $set: { password: hashedPassword } }
    );
}

}

export const userService = new UserService();

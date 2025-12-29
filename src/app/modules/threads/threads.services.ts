import mongoose from "mongoose";
import {
    ThreadModel,
    ThreadLikeModel,
    ThreadCommentModel,
    IThread,
    CommentLikeModel
} from "./threads.model";


const tryNumber = (val: any) =>
    typeof val === "string" && /^\d+$/.test(val) ? Number(val) : val;

class ThreadsService {

    async createThreads(payload: Partial<IThread>) {
        const thread = new ThreadModel(payload);
        const result = await thread.save();
        return { status: true, message: "Thread created", data: result };
    }

    async updateThreads(ThreadId: any, payload: Partial<IThread>) {
        const updated = await ThreadModel.findOneAndUpdate(
            { ThreadId: tryNumber(ThreadId) },
            { $set: payload },
            { new: true }
        ).lean();

        if (!updated)
            return { status: false, message: "Thread not found", data: [] };

        return { status: true, message: "Thread updated", data: updated };
    }

    async deleteThreads(ThreadId: any) {
        const deleted = await ThreadModel.findOneAndDelete({
            ThreadId: tryNumber(ThreadId)
        }).lean();

        if (!deleted)
            return { status: false, message: "Thread not found", data: [] };

        return { status: true, message: "Thread deleted", data: deleted };
    }

    async getThreads(query: any) {
        const { page = 1, limit = 10, search, CategoryId, userId } = query;
        const skip = (page - 1) * limit;

        let filter: any = {};
        if (search)
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } }
            ];

        if (CategoryId) filter.CategoryId = tryNumber(CategoryId);
        if (userId) filter.userId = tryNumber(userId);

        const total = await ThreadModel.countDocuments(filter);
        const data = await ThreadModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean();

        return {
            status: true,
            message: "Threads fetched",
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            data
        };
    }

    async FullgetThreads(query: any) {
        const {
            page = 1,
            limit = 10,
            search,
            CategoryId,
            userId,
            ThreadId
        } = query;
        const skip = (Number(page) - 1) * Number(limit);
        let match: any = {};
        if (search) {
            match.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } }
            ];
        }
        if (CategoryId) {
            match.CategoryId = tryNumber(CategoryId);
        }
        if (userId) {
            match.userId = tryNumber(userId);
        }
        if (ThreadId) {
            match.ThreadId = tryNumber(ThreadId);
        }
        const pipeline: any[] = [
            { $match: match },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "userId",
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "Categories",
                    localField: "CategoryId",
                    foreignField: "CategoryId",
                    as: "categories"
                }
            },
            {
                $lookup: {
                    from: "threadlikes",
                    localField: "ThreadId",
                    foreignField: "ThreadId",
                    as: "likes"
                }
            },
            {
                $lookup: {
                    from: "threadcomments",
                    localField: "ThreadId",
                    foreignField: "ThreadId",
                    as: "comments"
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: Number(limit) },
            {
                $project: {
                    ThreadId: 1,
                    title: 1,
                    content: 1,
                    images: 1,
                    createdAt: 1,
                    likesCount: { $size: "$likes" },
                    commentsCount: { $size: "$comments" },
                    user: {
                        userId: "$user.userId",
                        name: "$user.name",
                        email: "$user.email",
                        ProfilePic: "$user.ProfilePic"
                    },
                    categories: {
                        $map: {
                            input: "$categories",
                            as: "cat",
                            in: {
                                CategoryId: "$$cat.CategoryId",
                                title: "$$cat.title",
                                route: "$$cat.route",
                                color: "$$cat.color"
                            }
                        }
                    },
                    likes: {
                        ThreadId: 1,
                        userId: 1
                    },
                    comments: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$comments",
                                    as: "c",
                                    cond: {
                                        $or: [
                                            { $eq: ["$$c.parentCommentId", null] },
                                            { $not: ["$$c.parentCommentId"] }
                                        ]
                                    }
                                }
                            },
                            as: "main",
                            in: {
                                CommentId: "$$main.CommentId",
                                userId: "$$main.userId",
                                comment: "$$main.comments",   // 👈 your field name
                                createdAt: "$$main.createdAt",

                                replies: {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: "$comments",
                                                as: "r1",
                                                cond: {
                                                    $eq: ["$$r1.parentCommentId", "$$main.CommentId"]
                                                }
                                            }
                                        },
                                        as: "reply1",
                                        in: {
                                            CommentId: "$$reply1.CommentId",
                                            userId: "$$reply1.userId",
                                            comment: "$$reply1.comments",
                                            createdAt: "$$reply1.createdAt",

                                            replies: {
                                                $filter: {
                                                    input: "$comments",
                                                    as: "r2",
                                                    cond: {
                                                        $eq: ["$$r2.parentCommentId", "$$reply1.CommentId"]
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            }
        ];
        const data = await ThreadModel.aggregate(pipeline);
        const total = await ThreadModel.countDocuments(match);
        return {
            status: true,
            message: "Threads fetched",
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            },
            data
        };
    }

    async getThreadsById(ThreadId: string) {
        const query = mongoose.Types.ObjectId.isValid(ThreadId)
            ? { _id: ThreadId }
            : { ThreadId: tryNumber(ThreadId) };

        const thread = await ThreadModel.findOne(query).lean();
        if (!thread)
            return { status: false, message: "Thread not found", data: [] };

        return { status: true, message: "Thread fetched", data: thread };
    }

    async toggleLike(ThreadId: number, userId: number) {
        const existing = await ThreadLikeModel.findOne({ ThreadId, userId });

        if (existing) {
            await ThreadLikeModel.deleteOne({ ThreadId, userId });
            await ThreadModel.updateOne({ ThreadId }, { $inc: { likes: -1 } });
            return { status: true, message: "Thread unliked" };
        }

        await ThreadLikeModel.create({ ThreadId, userId });
        await ThreadModel.updateOne({ ThreadId }, { $inc: { likes: 1 } });
        return { status: true, message: "Thread liked" };
    }

    // 💬 ADD COMMENT
    async addComment(ThreadId: number, userId: number, comments: string) {
        const comment = await ThreadCommentModel.create({
            ThreadId,
            userId,
            comments
        });

        await ThreadModel.updateOne(
            { ThreadId },
            { $inc: { commentsCount: 1 } }
        );

        return { status: true, message: "Comment added", data: comment };
    }

    async getComments(ThreadId: number) {
        const comments = await ThreadCommentModel.find({ ThreadId })
            .sort({ createdAt: -1 })
            .lean();

        return { status: true, message: "Comments fetched", data: comments };
    }

    async toggleCommentLike(
        ThreadId: number,
        CommentId: number,
        userId: number
    ) {
        const existing = await CommentLikeModel.findOne({
            ThreadId,
            CommentId,
            userId
        });

        if (existing) {
            await CommentLikeModel.deleteOne({
                ThreadId,
                CommentId,
                userId
            });

            await ThreadCommentModel.updateOne(
                { CommentId },
                { $inc: { likes: -1 } }
            );

            return { status: true, message: "comment unliked" };
        }

        await CommentLikeModel.create({
            ThreadId,
            CommentId,
            userId
        });

        await ThreadCommentModel.updateOne(
            { CommentId },
            { $inc: { likes: 1 } }
        );

        return { status: true, message: "comment liked" };
    }

    async getThreadComments(
        ThreadId: number,
        userId?: number
    ) {
        const comments = await ThreadCommentModel.aggregate([
            {
                $match: { ThreadId }
            },
            {
                $lookup: {
                    from: "commentlikes",
                    let: { commentId: "$CommentId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$CommentId", "$$commentId"] }
                            }
                        }
                    ],
                    as: "likesData"
                }
            },
            {
                $addFields: {
                    likes: { $size: "$likesData" },
                    isLikedByMe: userId
                        ? {
                            $in: [userId, "$likesData.userId"]
                        }
                        : false
                }
            },
            {
                $project: {
                    likesData: 0
                }
            },

            { $sort: { createdAt: 1 } }
        ]);
        const map = new Map<number, any>();
        const roots: any[] = [];
        comments.forEach(c => {
            c.replies = [];
            map.set(c.CommentId, c);
        });
        comments.forEach(c => {
            if (c.parentCommentId) {
                map.get(c.parentCommentId)?.replies.push(c);
            } else {
                roots.push(c);
            }
        });

        return roots;
    }

    async replyComment(
        ThreadId: number,
        parentCommentId: number,
        userId: number,
        comments: string
    ) {
        // 1️⃣ Find parent comment
        const parent = await ThreadCommentModel.findOne({
            CommentId: parentCommentId,
            ThreadId
        });

        if (!parent) {
            return {
                status: false,
                message: "Parent comment not found"
            };
        }

        // 2️⃣ Enforce max depth
        if (parent.level >= 2) {
            return {
                status: false,
                message: "Reply limit reached (max 2 levels)"
            };
        }

        // 3️⃣ Create reply
        const reply = await ThreadCommentModel.create({
            ThreadId,
            userId,
            comments,
            parentCommentId: parent.CommentId,
            level: parent.level + 1
        });

        return {
            status: true,
            message: "Reply added",
            data: reply
        };
    }

    async getreplyComment(ThreadId: number, parentCommentId: number) {
        const comments = await ThreadCommentModel.find({ ThreadId, parentCommentId })
            .sort({ createdAt: -1 })
            .lean();

        return { status: true, message: "Reply Comments fetched", data: comments };
    }

}

export const threadsService = new ThreadsService();

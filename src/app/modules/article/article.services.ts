import {
    ArticleCommentLikeModel,
    ArticleCommentModel,
    ArticleModel,
    ArticleReactionModel,
    SavedArticleModel
} from "./article.model";

class ArticleService {

    async toggleArticleReaction(
        sanityArticleId: string,
        articleName: string,
        userId: number,
        reaction: "like" | "dislike"
    ) {
        let article = await ArticleModel.findOne({ sanityArticleId });

        if (!article) {
            article = await ArticleModel.create({
                sanityArticleId,
                name: articleName
            });
        }

        const ArticleId = article.ArticleId;

        const existing = await ArticleReactionModel.findOne({
            ArticleId,
            userId
        });

        if (!existing) {
            await ArticleReactionModel.create({
                ArticleId,
                sanityArticleId,
                userId,
                reaction
            });

            await ArticleModel.updateOne(
                { ArticleId },
                { $inc: reaction === "like" ? { likeCount: 1 } : { dislikeCount: 1 } }
            );

            return { status: true, message: "Reaction added" };
        }

        if (existing.reaction === reaction) {
            await ArticleReactionModel.deleteOne({ _id: existing._id });

            await ArticleModel.updateOne(
                { ArticleId },
                { $inc: reaction === "like" ? { likeCount: -1 } : { dislikeCount: -1 } }
            );

            return { status: true, message: "Reaction removed" };
        }

        await ArticleReactionModel.updateOne(
            { _id: existing._id },
            { reaction }
        );

        await ArticleModel.updateOne(
            { ArticleId },
            {
                $inc:
                    reaction === "like"
                        ? { likeCount: 1, dislikeCount: -1 }
                        : { dislikeCount: 1, likeCount: -1 }
            }
        );

        return { status: true, message: "Reaction updated" };
    }

    async getArticleReactionStatus(
        sanityArticleId: string,
        userId?: number
    ) {
        const article = await ArticleModel.findOne(
            { sanityArticleId },
            { _id: 0, ArticleId: 1, name: 1, likeCount: 1, dislikeCount: 1 }
        );

        if (!article) {
            return null;
        }
        let userReaction: "like" | "dislike" | null = null;
        if (userId) {
            const reaction = await ArticleReactionModel.findOne({
                ArticleId: article.ArticleId,
                userId
            });
            userReaction = reaction ? reaction.reaction : null;
        }
        const likedUsers = await ArticleReactionModel.find(
            {
                ArticleId: article.ArticleId,
                reaction: "like"
            },
            { _id: 0, userId: 1 }
        );

        return {
            sanityArticleId,
            name: article.name,
            likeCount: article.likeCount,
            dislikeCount: article.dislikeCount,
            userReaction,
            usersWhoLiked: likedUsers.map(u => u.userId)
        };
    }

    async addArticleComment(
        sanityArticleId: string,
        userId: number,
        comment: string,
        parentCommentId?: number
    ) {
        const article = await ArticleModel.findOne({ sanityArticleId });
        if (!article) {
            throw new Error("Article not found");
        }

        let level = 0;

        if (parentCommentId) {
            const parent = await ArticleCommentModel.findOne({
                CommentId: parentCommentId
            });

            if (!parent) {
                throw new Error("Parent comment not found");
            }

            level = parent.level + 1;
        }

        return ArticleCommentModel.create({
            sanityArticleId,
            ArticleId: article.ArticleId,
            userId,
            comment,
            parentCommentId: parentCommentId ?? null,
            level
        });
    }

    async toggleArticleCommentLike(
        CommentId: number,
        userId: number
    ) {
        const existing = await ArticleCommentLikeModel.findOne({
            CommentId,
            userId
        });

        if (!existing) {
            await ArticleCommentLikeModel.create({ CommentId, userId });

            await ArticleCommentModel.updateOne(
                { CommentId },
                { $inc: { likeCount: 1 } }
            );

            return { status: true, message: "Comment liked" };
        }

        await ArticleCommentLikeModel.deleteOne({ _id: existing._id });

        await ArticleCommentModel.updateOne(
            { CommentId },
            { $inc: { likeCount: -1 } }
        );

        return { status: true, message: "Comment unliked" };
    }

    async getArticleComments(
        sanityArticleId: string
    ) {
        return ArticleCommentModel.find(
            { sanityArticleId },
            { _id: 0 }
        ).sort({ createdAt: 1 });
    }

async getArticleCommentReactionCount(CommentId: number) {
    const comment = await ArticleCommentModel.findOne(
        { CommentId },
        {
            _id: 0,
            CommentId: 1,
            likeCount: 1,
            dislikeCount: 1
        }
    ).lean();

    if (!comment) return null;

    // 2️⃣ Get users who liked the comment
    const likedUsers = await ArticleCommentLikeModel.find(
        { CommentId },
        { _id: 0, userId: 1 }
    ).lean();

    return {
        CommentId: comment.CommentId,
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount,
        likedUsers: likedUsers.map(l => l.userId)
    };
}

    async toggleSaveArticle(sanityArticleId: string, userId: number) {
        const existing = await SavedArticleModel.findOne({
            sanityArticleId,
            userId
        });
        if (existing) {
            await SavedArticleModel.deleteOne({ sanityArticleId, userId });
            return { status: true, message: "Article unsaved" };
        }
        const articleExists = await ArticleModel.exists({ sanityArticleId });
        if (!articleExists) {
            return { status: false, message: "Article not found" };
        }
        await SavedArticleModel.create({ sanityArticleId, userId });
        return { status: true, message: "Article saved" };
    }

    async getMySavedArticles(userId: number, query: any) {
        const { page = 1, limit = 10 } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const data = await SavedArticleModel.aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: "articles",
                    localField: "sanityArticleId",
                    foreignField: "sanityArticleId",
                    as: "article"
                }
            },
            { $unwind: "$article" },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: Number(limit) },
            {
                $project: {
                    _id: 0,
                    sanityArticleId: 1,
                    savedAt: "$createdAt",
                    article: {
                        sanityArticleId: "$article.sanityArticleId",
                        name: "$article.name",
                        likeCount: "$article.likeCount",
                        dislikeCount: "$article.dislikeCount",
                        createdAt: "$article.createdAt"
                    }
                }
            }
        ]);
        const total = await SavedArticleModel.countDocuments({ userId });
        return {
            status: true,
            message: "Saved articles fetched",
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            },
            data
        };
    }

    async getSavedUsersForMyArticle(
        sanityArticleId: string,
        userId: number,
        query: any
    ) {
        const { page = 1, limit = 10 } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const article = await ArticleModel.findOne({
            sanityArticleId,
            userId
        }).lean();

        // if (!article) {
        //     return {
        //         status: false,
        //         message: "Unauthorized: You are not the creator of this article"
        //     };
        // }

        const data = await SavedArticleModel.aggregate([
            { $match: { sanityArticleId } },

            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "userId",
                    as: "savedBy"
                }
            },
            { $unwind: "$savedBy" },

            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: Number(limit) },

            {
                $project: {
                    _id: 0,
                    savedAt: "$createdAt",
                    savedBy: {
                        userId: "$savedBy.userId",
                        name: "$savedBy.name",
                        email: "$savedBy.email",
                        ProfilePic: "$savedBy.ProfilePic"
                    }
                }
            }
        ]);
        const total = await SavedArticleModel.countDocuments({ sanityArticleId });
        return {
            status: true,
            message: "Saved users fetched",
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            },
            data
        };
    }

}

export const articleService = new ArticleService();

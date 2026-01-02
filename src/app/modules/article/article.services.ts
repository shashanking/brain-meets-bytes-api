import {
    ArticleCommentLikeModel,
    ArticleCommentModel,
    ArticleModel,
    ArticleReactionModel
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

        if (!article || (article.likeCount === 0 && article.dislikeCount === 0)) {
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

        return {
            sanityArticleId,
            name: article.name,
            likeCount: article.likeCount,
            dislikeCount: article.dislikeCount,
            userReaction
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
            { _id: 0, CommentId: 1, likeCount: 1, dislikeCount: 1 }
        );

        if (!comment) {
            return null;
        }

        return {
            CommentId,
            likeCount: comment.likeCount,
            dislikeCount: comment.dislikeCount
        };
    }

}

export const articleService = new ArticleService();

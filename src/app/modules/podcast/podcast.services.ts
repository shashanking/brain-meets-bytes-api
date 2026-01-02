import {
    PodcastCommentLikeModel,
    PodcastCommentModel,
    PodcastModel,
    PodcastReactionModel
} from "./podcast.model";

class PodcastService {

    async togglePodcastReaction(
        sanityPodcastId: string,
        podcastName: string,
        userId: number,
        reaction: "like" | "dislike"
    ) {
        let podcast = await PodcastModel.findOne({ sanityPodcastId });

        if (!podcast) {
            podcast = await PodcastModel.create({
                sanityPodcastId,
                name: podcastName
            });
        }

        const PodcastId = podcast.PodcastId;

        const existing = await PodcastReactionModel.findOne({
            PodcastId,
            userId
        });

        if (!existing) {
            await PodcastReactionModel.create({
                PodcastId,
                sanityPodcastId,
                userId,
                reaction
            });

            await PodcastModel.updateOne(
                { PodcastId },
                { $inc: reaction === "like" ? { likeCount: 1 } : { dislikeCount: 1 } }
            );

            return { status: true, message: "Reaction added" };
        }

        if (existing.reaction === reaction) {
            await PodcastReactionModel.deleteOne({ _id: existing._id });

            await PodcastModel.updateOne(
                { PodcastId },
                { $inc: reaction === "like" ? { likeCount: -1 } : { dislikeCount: -1 } }
            );

            return { status: true, message: "Reaction removed" };
        }

        await PodcastReactionModel.updateOne(
            { _id: existing._id },
            { reaction }
        );

        await PodcastModel.updateOne(
            { PodcastId },
            {
                $inc:
                    reaction === "like"
                        ? { likeCount: 1, dislikeCount: -1 }
                        : { dislikeCount: 1, likeCount: -1 }
            }
        );

        return { status: true, message: "Reaction updated" };
    }

    async getPodcastReactionStatus(
        sanityPodcastId: string,
        userId?: number
    ) {
        const podcast = await PodcastModel.findOne(
            { sanityPodcastId },
            { _id: 0, PodcastId: 1, name: 1, likeCount: 1, dislikeCount: 1 }
        );

        if (!podcast || (podcast.likeCount === 0 && podcast.dislikeCount === 0)) {
            return null;
        }

        let userReaction: "like" | "dislike" | null = null;

        if (userId) {
            const reaction = await PodcastReactionModel.findOne({
                PodcastId: podcast.PodcastId,
                userId
            });

            userReaction = reaction ? reaction.reaction : null;
        }

        return {
            sanityPodcastId,
            name: podcast.name,
            likeCount: podcast.likeCount,
            dislikeCount: podcast.dislikeCount,
            userReaction
        };
    }

    async addPodcastComment(
        sanityPodcastId: string,
        userId: number,
        comment: string,
        parentCommentId?: number
    ) {
        const podcast = await PodcastModel.findOne({ sanityPodcastId });
        if (!podcast) {
            throw new Error("Podcast not found");
        }

        let level = 0;

        if (parentCommentId) {
            const parent = await PodcastCommentModel.findOne({
                CommentId: parentCommentId
            });

            if (!parent) {
                throw new Error("Parent comment not found");
            }

            level = parent.level + 1;
        }

        return PodcastCommentModel.create({
            sanityPodcastId,
            PodcastId: podcast.PodcastId,
            userId,
            comment,
            parentCommentId: parentCommentId ?? null,
            level
        });
    }

    async togglePodcastCommentLike(
        CommentId: number,
        userId: number
    ) {
        const existing = await PodcastCommentLikeModel.findOne({
            CommentId,
            userId
        });

        if (!existing) {
            await PodcastCommentLikeModel.create({ CommentId, userId });

            await PodcastCommentModel.updateOne(
                { CommentId },
                { $inc: { likeCount: 1 } }
            );

            return { status: true, message: "Comment liked" };
        }

        await PodcastCommentLikeModel.deleteOne({ _id: existing._id });

        await PodcastCommentModel.updateOne(
            { CommentId },
            { $inc: { likeCount: -1 } }
        );

        return { status: true, message: "Comment unliked" };
    }

    async getPodcastComments(
        sanityPodcastId: string
    ) {
        return PodcastCommentModel.find(
            { sanityPodcastId },
            { _id: 0 }
        ).sort({ createdAt: 1 });
    }

    async getPodcastCommentReactionCount(CommentId: number) {
        const comment = await PodcastCommentModel.findOne(
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

export const podcastService = new PodcastService();

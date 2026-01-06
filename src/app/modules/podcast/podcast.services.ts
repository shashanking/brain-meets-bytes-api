import {
    PodcastCommentLikeModel,
    PodcastCommentModel,
    PodcastModel,
    PodcastReactionModel,
    SavedPodcastModel
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

        if (!podcast) {
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
        const likedUsers = await PodcastReactionModel.find(
            {
                PodcastId: podcast.PodcastId,
                reaction: "like"
            },
            { _id: 0, userId: 1 }
        );
        return {
            sanityPodcastId,
            name: podcast.name,
            likeCount: podcast.likeCount,
            dislikeCount: podcast.dislikeCount,
            PodcastId: podcast.PodcastId,
            userReaction,
            usersWhoLiked: likedUsers.map(u => u.userId)
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

    async toggleSavePodcast(sanityPodcastId: string, userId: number) {
        const existing = await SavedPodcastModel.findOne({
            sanityPodcastId,
            userId
        });
        if (existing) {
            await SavedPodcastModel.deleteOne({ sanityPodcastId, userId });
            return { status: true, message: "Podcast unsaved" };
        }
        const podcastExists = await PodcastModel.exists({ sanityPodcastId });
        if (!podcastExists) {
            return { status: false, message: "Podcast not found" };
        }
        await SavedPodcastModel.create({ sanityPodcastId, userId });
        return { status: true, message: "Podcast saved" };
    }

    async getMySavedPodcasts(userId: number, query: any) {
        const { page = 1, limit = 10 } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const data = await SavedPodcastModel.aggregate([
            { $match: { userId } },

            {
                $lookup: {
                    from: "podcasts",
                    localField: "sanityPodcastId",
                    foreignField: "sanityPodcastId",
                    as: "podcast"
                }
            },
            { $unwind: "$podcast" },

            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: Number(limit) },

            {
                $project: {
                    _id: 0,
                    sanityPodcastId: 1,
                    savedAt: "$createdAt",
                    podcast: {
                        sanityPodcastId: "$podcast.sanityPodcastId",
                        name: "$podcast.name",
                        likeCount: "$podcast.likeCount",
                        dislikeCount: "$podcast.dislikeCount",
                        createdAt: "$podcast.createdAt"
                    }
                }
            }
        ]);

        const total = await SavedPodcastModel.countDocuments({ userId });

        return {
            status: true,
            message: "Saved podcasts fetched",
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            },
            data
        };
    }

    async getSavedUsersForMyPodcast(
        sanityPodcastId: string,
        userId: number,
        query: any
    ) {
        const { page = 1, limit = 10 } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const podcast = await PodcastModel.findOne({
            sanityPodcastId,
            userId 
        }).lean();

        // if (!podcast) {
        //     return {
        //         status: false,
        //         message: "Unauthorized: You are not the creator of this podcast"
        //     };
        // }

        const data = await SavedPodcastModel.aggregate([
            { $match: { sanityPodcastId } },

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
        const total = await SavedPodcastModel.countDocuments({ sanityPodcastId });
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

export const podcastService = new PodcastService();

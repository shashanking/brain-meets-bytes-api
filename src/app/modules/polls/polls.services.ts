import {
    PollModel,
    PollOptionModel,
    PollVoteModel
} from "./polls.model";
import Counter from "../core.model";

class PollService {

    async createPoll(
        title: string,
        description: string,
        options: string[],
        userId: number
    ) {
        if (!options || options.length < 2) {
            throw new Error("At least 2 options are required");
        }

        const poll = await PollModel.create({
            title,
            description,
            userId
        });

        const optionDocs = [];

        for (const text of options) {
            const counter = await Counter.findByIdAndUpdate(
                { _id: "PollOptionId" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );

            optionDocs.push({
                OptionId: counter.seq,
                PollId: poll.PollId,
                text
            });
        }

        await PollOptionModel.insertMany(optionDocs);

        return poll;
    }

    async updatePoll(
        PollId: number,
        title?: string,
        description?: string,
        userId?: number
    ) {
        const poll = await PollModel.findOne({ PollId });

        if (!poll) {
            throw new Error("Poll not found");
        }

        if (poll.userId !== userId) {
            throw new Error("Forbidden: You are not the poll owner");
        }

        const updatedPoll = await PollModel.findOneAndUpdate(
            { PollId },
            {
                $set: {
                    ...(title && { title }),
                    ...(description && { description })
                }
            },
            { new: true }
        );

        return updatedPoll;
    }

    async getAllPolls() {
        const polls = await PollModel.find({}, { _id: 0 })
            .sort({ createdAt: -1 })
            .lean();

        if (!polls.length) return [];
        const pollIds = polls.map(p => p.PollId);
        const options = await PollOptionModel.find(
            { PollId: { $in: pollIds } },
            { _id: 0 }
        ).lean();
        const votes = await PollVoteModel.find(
            { PollId: { $in: pollIds } },
            { _id: 0 }
        ).lean();
        const voteMap: Record<number, Record<number, number[]>> = {};
        for (const vote of votes) {
            if (!voteMap[vote.PollId]) {
                voteMap[vote.PollId] = {};
            }
            if (!voteMap[vote.PollId][vote.OptionId]) {
                voteMap[vote.PollId][vote.OptionId] = [];
            }
            voteMap[vote.PollId][vote.OptionId].push(vote.userId);
        }
        const optionMap: Record<number, any[]> = {};
        for (const opt of options) {
            if (!optionMap[opt.PollId]) {
                optionMap[opt.PollId] = [];
            }
            optionMap[opt.PollId].push({
                ...opt,
                votedUserIds:
                    voteMap[opt.PollId]?.[opt.OptionId] || []
            });
        }
        return polls.map(poll => ({
            ...poll,
            options: optionMap[poll.PollId] || []
        }));
    }

    async getPollById(PollId: number) {
        const poll = await PollModel.findOne(
            { PollId },
            { _id: 0 }
        ).lean();

        if (!poll) return null;

        const options = await PollOptionModel.find(
            { PollId },
            { _id: 0 }
        ).lean();

        return {
            ...poll,
            options
        };
    }

    async votePoll(
        PollId: number,
        optionId: number,
        userId: number
    ) {
        const poll = await PollModel.findOne({ PollId });
        if (!poll) throw new Error("Poll not found");

        const option = await PollOptionModel.findOne({
            PollId,
            OptionId: optionId
        });
        if (!option) throw new Error("Invalid option");

        const existingVote = await PollVoteModel.findOne({
            PollId,
            userId
        });
        if (!existingVote) {
            await PollVoteModel.create({
                PollId,
                OptionId: optionId,
                userId
            });

            await PollOptionModel.updateOne(
                { OptionId: optionId },
                { $inc: { voteCount: 1 } }
            );

            await PollModel.updateOne(
                { PollId },
                { $inc: { totalVotes: 1 } }
            );

            return { status: true, message: "Vote submitted" };
        }
        if (existingVote.OptionId === optionId) {
            return { status: true, message: "Already voted for this option" };
        }
        await PollVoteModel.updateOne(
            { _id: existingVote._id },
            { OptionId: optionId }
        );
        await PollOptionModel.updateOne(
            { OptionId: existingVote.OptionId },
            { $inc: { voteCount: -1 } }
        );

        await PollOptionModel.updateOne(
            { OptionId: optionId },
            { $inc: { voteCount: 1 } }
        );

        return { status: true, message: "Vote updated" };
    }

    async getPollResult(
        PollId: number,
        userId: number
    ) {
        const poll = await PollModel.findOne({ PollId });
        if (!poll) return null;

        const voted = await PollVoteModel.findOne({
            PollId: poll.PollId,
            userId
        });

        if (!voted) {
            throw new Error("Vote to see results");
        }

        const options = await PollOptionModel.find(
            { PollId: poll.PollId },
            { _id: 0 }
        );

        return {
            PollId,
            title: poll.title,
            description: poll.description,
            totalVotes: poll.totalVotes,
            options
        };
    }
}

export const pollService = new PollService();

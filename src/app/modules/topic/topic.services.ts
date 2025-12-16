import mongoose from "mongoose";
import TopicModel, { ITopic } from "./topic.model";

const tryNumber = (val: any) => {
    if (typeof val !== "string") return val;
    if (/^\d+$/.test(val)) return Number(val);
    if (/^\d+\.\d+$/.test(val)) return Number(val);
    return val;
};

class TopicService {

    async findByRoute(route: string): Promise<ITopic | null> {
        return TopicModel.findOne({ route }).exec();
    }

    async saveTopicValues(payload: any) {
        try {
            const TopicPayload = new TopicModel(payload);
            const result = await TopicPayload.save();

            if (result) {
                return {
                    status: true,
                    message: "Topic created",
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

    async updateTopicValues(TopicId: any, payload: any) {
        try {
            if (TopicId === undefined || TopicId === null) {
                return { status: false, data: [], message: "TopicId is required" };
            }

            const queryTopicId =
                typeof TopicId === "string" && /^\d+$/.test(TopicId)
                    ? Number(TopicId)
                    : TopicId;

            const updated = await TopicModel.findOneAndUpdate(
                { TopicId: queryTopicId },
                { $set: payload },
                { new: true, runValidators: true }
            ).lean();

            if (updated) {
                return { status: true, message: "Topic updated", data: updated };
            }

            return { status: false, data: [], message: "Topic not found" };

        } catch (error: any) {
            return { status: false, data: [], message: error.message };
        }
    }

    async deleteTopicByTopicId(TopicId: any) {
        try {
            if (TopicId === undefined || TopicId === null) {
                return { status: false, data: [], message: "TopicId is required" };
            }

            const queryTopicId =
                typeof TopicId === "string" && /^\d+$/.test(TopicId)
                    ? Number(TopicId)
                    : TopicId;

            const deleted = await TopicModel.findOneAndDelete({
                TopicId: queryTopicId
            }).lean();

            if (deleted) {
                return { status: true, message: "Topic deleted", data: deleted };
            }

            return { status: false, data: [], message: "Topic not found" };

        } catch (error: any) {
            return { status: false, data: [], message: error.message };
        }
    }

    async getTopics(query: any) {
        try {
            const {
                page = 1,
                limit = 10,
                sort = "-createdAt",
                searchField,
                searchValue,
                filter
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

            // Add remaining filters
            const reserved = [
                "page",
                "limit",
                "sort",
                "searchField",
                "searchValue",
                "filter",
                "TopicId"
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

            const totalCounts = await TopicModel.countDocuments(filterObj);
            const results = await TopicModel.find(filterObj)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean();

            return {
                status: true,
                message: "Topics fetched",
                meta: {
                    total: totalCounts,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(totalCounts / limitNum) || 0,
                    data: results
                }
            };
        } catch (error: any) {
            return {
                status: false,
                data: [],
                message: error.message || "Failed to fetch Topics"
            };
        }
    }

    async getTopicByTopicId(TopicId: string) {
        try {
            if (!TopicId) {
                return { status: false, data: [], message: "TopicId is required" };
            }

            let query: any = {};

            if (/^[0-9]+$/.test(TopicId)) {
                query.TopicId = Number(TopicId);
            } else if (mongoose.Types.ObjectId.isValid(TopicId)) {
                query._id = new mongoose.Types.ObjectId(TopicId);
            } else {
                query.TopicId = TopicId;
            }

            const found = await TopicModel.findOne(query).lean();

            if (!found) {
                return { status: false, data: [], message: "Topic not found" };
            }

            return { status: true, message: "Topic fetched", data: found };

        } catch (error: any) {
            return {
                status: false,
                data: [],
                message: error.message || "Failed to fetch Topic"
            };
        }
    }
}

export const topicService = new TopicService();

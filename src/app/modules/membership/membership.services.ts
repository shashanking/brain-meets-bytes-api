import mongoose from "mongoose";
import MembershipModel, { IMembership } from "./membership.model";

const tryNumber = (val: any) => {
  if (typeof val !== "string") return val;
  if (/^\d+$/.test(val)) return Number(val);
  if (/^\d+\.\d+$/.test(val)) return Number(val);
  return val;
};

class MembershipService {


  async createMembership(payload: Partial<IMembership>) {
    try {
      const membership = new MembershipModel(payload);
      const result = await membership.save();

      return {
        status: true,
        message: "Membership created",
        data: result
      };
    } catch (error: any) {
      return {
        status: false,
        data: [],
        message: error.message
      };
    }
  }

  async updateMembership(MembershipId: any, payload: Partial<IMembership>) {
    try {
      if (MembershipId === undefined || MembershipId === null) {
        return {
          status: false,
          data: [],
          message: "MembershipId is required"
        };
      }

      const queryMembershipId =
        typeof MembershipId === "string" && /^\d+$/.test(MembershipId)
          ? Number(MembershipId)
          : MembershipId;

      const updated = await MembershipModel.findOneAndUpdate(
        { MembershipId: queryMembershipId },
        { $set: payload },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) {
        return {
          status: false,
          data: [],
          message: "Membership not found"
        };
      }

      return {
        status: true,
        message: "Membership updated",
        data: updated
      };

    } catch (error: any) {
      return {
        status: false,
        data: [],
        message: error.message
      };
    }
  }

  async deleteMembership(MembershipId: any) {
    try {
      if (MembershipId === undefined || MembershipId === null) {
        return {
          status: false,
          data: [],
          message: "MembershipId is required"
        };
      }

      const queryMembershipId =
        typeof MembershipId === "string" && /^\d+$/.test(MembershipId)
          ? Number(MembershipId)
          : MembershipId;

      const deleted = await MembershipModel.findOneAndDelete({
        MembershipId: queryMembershipId
      }).lean();

      if (!deleted) {
        return {
          status: false,
          data: [],
          message: "Membership not found"
        };
      }

      return {
        status: true,
        message: "Membership deleted",
        data: deleted
      };

    } catch (error: any) {
      return {
        status: false,
        data: [],
        message: error.message
      };
    }
  }

  async getMemberships(query: any) {
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
          const parsed =
            typeof filter === "string" ? JSON.parse(filter) : filter;

          if (parsed && typeof parsed === "object") {
            Object.keys(parsed).forEach((k) => {
              filterObj[k] = tryNumber(parsed[k]);
            });
          }
        } catch {}
      }

      // Reserved query keys
      const reserved = [
        "page",
        "limit",
        "sort",
        "searchField",
        "searchValue",
        "filter"
      ];

      Object.keys(query || {}).forEach((k) => {
        if (reserved.includes(k)) return;
        if (filterObj[k] !== undefined) return;

        filterObj[k] = tryNumber(query[k]);
      });

      // Search support
      if (searchField && searchValue) {
        filterObj[searchField] = {
          $regex: String(searchValue),
          $options: "i"
        };
      }

      const totalCounts = await MembershipModel.countDocuments(filterObj);

      const results = await MembershipModel.find(filterObj)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();

      return {
        status: true,
        message: "Memberships fetched",
        meta: {
          total: totalCounts,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCounts / limitNum) || 0
        },
        data: results
      };

    } catch (error: any) {
      return {
        status: false,
        data: [],
        message: error.message || "Failed to fetch memberships"
      };
    }
  }
  
  async getMembershipById(MembershipId: string) {
    try {
      if (!MembershipId) {
        return {
          status: false,
          data: [],
          message: "MembershipId is required"
        };
      }

      let query: any = {};

      if (/^[0-9]+$/.test(MembershipId)) {
        query.MembershipId = Number(MembershipId);
      } else if (mongoose.Types.ObjectId.isValid(MembershipId)) {
        query._id = new mongoose.Types.ObjectId(MembershipId);
      } else {
        query.MembershipId = MembershipId;
      }

      const found = await MembershipModel.findOne(query).lean();

      if (!found) {
        return {
          status: false,
          data: [],
          message: "Membership not found"
        };
      }

      return {
        status: true,
        message: "Membership fetched",
        data: found
      };

    } catch (error: any) {
      return {
        status: false,
        data: [],
        message: error.message || "Failed to fetch membership"
      };
    }
  }
}

export const membershipService = new MembershipService();

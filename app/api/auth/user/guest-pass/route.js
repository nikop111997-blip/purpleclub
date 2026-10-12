import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    // =====================================================
    // AUTH
    // =====================================================

    const session = await auth();

    if (!session?.user?.memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const memberId = session.user.memberId;

    if (!ObjectId.isValid(memberId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid member",
        },
        { status: 400 }
      );
    }

    const inviterId = new ObjectId(memberId);

    // =====================================================
    // DATABASE
    // =====================================================

    const db = await getDB();

    // =====================================================
    // CHECK MEMBER
    // =====================================================

    const member = await db.collection("members").findOne({
      _id: inviterId,
      isActive: true,
    });

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // BASE URL
    // =====================================================

    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000"
    ).replace(/\/+$/, "");

    // =====================================================
    // GET ALL GUEST INVITES
    // =====================================================

    const invites = await db
      .collection("guest_invites")
      .aggregate([
        // -------------------------------------------------
        // 1. Only this member's invitations
        // -------------------------------------------------

        {
          $match: {
            inviterMemberId: inviterId,
          },
        },

        // -------------------------------------------------
        // 2. Event
        // -------------------------------------------------

        {
          $lookup: {
            from: "events",
            localField: "eventId",
            foreignField: "_id",
            as: "event",
          },
        },

        {
          $unwind: {
            path: "$event",
            preserveNullAndEmptyArrays: true,
          },
        },

        // -------------------------------------------------
        // 3. Guest member
        // -------------------------------------------------

        {
          $lookup: {
            from: "members",
            localField: "guestUserId",
            foreignField: "_id",
            as: "guestMember",
          },
        },

        {
          $unwind: {
            path: "$guestMember",
            preserveNullAndEmptyArrays: true,
          },
        },

        // -------------------------------------------------
        // 4. Membership
        // -------------------------------------------------

        {
          $lookup: {
            from: "memberships",
            localField: "guestUserId",
            foreignField: "memberId",
            as: "membership",
          },
        },

        {
          $unwind: {
            path: "$membership",
            preserveNullAndEmptyArrays: true,
          },
        },

        // -------------------------------------------------
        // 5. Referral
        // -------------------------------------------------

        {
          $lookup: {
            from: "referrals",
            let: {
              inviteId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$inviteId", "$$inviteId"],
                  },
                },
              },
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $limit: 1,
              },
            ],
            as: "referral",
          },
        },

        {
          $unwind: {
            path: "$referral",
            preserveNullAndEmptyArrays: true,
          },
        },

        // -------------------------------------------------
        // 6. Newest invitations first
        // -------------------------------------------------

        {
          $sort: {
            createdAt: -1,
          },
        },

        // -------------------------------------------------
        // 7. Project required fields
        // -------------------------------------------------

        {
          $project: {
            _id: 1,

            inviterMemberId: 1,

            guestName: 1,
            guestMobile: 1,

            status: 1,

            eventId: 1,

            guestUserId: 1,

            registrationId: 1,

            referralId: 1,

            tokenHash: 1,

            shareToken: 1,

            createdAt: 1,
            registeredAt: 1,
            attendedAt: 1,
            cancelledAt: 1,

            // ---------------------------------------------
            // EVENT
            // ---------------------------------------------

            event: {
              _id: "$event._id",
              name: "$event.name",
              title: "$event.title",
              date: "$event.date",
              time: "$event.time",
              location: "$event.location",
              image: "$event.image",
              status: "$event.status",
            },

            // ---------------------------------------------
            // GUEST MEMBER
            // ---------------------------------------------

            guest: {
              _id: "$guestMember._id",
              name: "$guestMember.name",
              mobile: "$guestMember.mobile",
              membershipStatus:
                "$guestMember.membershipStatus",
              isActive: "$guestMember.isActive",
            },

            // ---------------------------------------------
            // MEMBERSHIP
            // ---------------------------------------------

            membership: {
              _id: "$membership._id",
              status: "$membership.status",
              plan: "$membership.plan",
              amount: "$membership.amount",
              startedAt: "$membership.startedAt",
              createdAt: "$membership.createdAt",
            },

            // ---------------------------------------------
            // REFERRAL
            // ---------------------------------------------

            referral: {
              _id: "$referral._id",
              status: "$referral.status",
              firstExperienceAt:
                "$referral.firstExperienceAt",
              membershipPurchasedAt:
                "$referral.membershipPurchasedAt",
              createdAt: "$referral.createdAt",
            },
          },
        },
      ])
      .toArray();

    // =====================================================
    // FORMAT INVITES
    // =====================================================

    const formattedInvites = invites.map((invite) => {
      // ---------------------------------------------------
      // Safe objects
      // ---------------------------------------------------

      const guestMember =
        invite.guest && invite.guest._id
          ? invite.guest
          : null;

      const membership =
        invite.membership &&
        invite.membership._id
          ? invite.membership
          : null;

      const referral =
        invite.referral &&
        invite.referral._id
          ? invite.referral
          : null;

      // ---------------------------------------------------
      // Safe IDs
      // ---------------------------------------------------

      const inviteId = invite._id
        ? invite._id.toString()
        : null;

      const eventId = invite.eventId
        ? invite.eventId.toString()
        : null;

      const guestId =
        guestMember?._id
          ? guestMember._id.toString()
          : null;

      const membershipId =
        membership?._id
          ? membership._id.toString()
          : null;

      const referralId =
        referral?._id
          ? referral._id.toString()
          : null;

      // ---------------------------------------------------
      // Membership status
      // ---------------------------------------------------

      const membershipStatus =
        guestMember?.membershipStatus || null;

      const membershipRecordExists =
        Boolean(membership?._id);

      const hasMembership =
        membershipRecordExists ||
        membership?.status === "ACTIVE" ||
        membershipStatus === "ACTIVE" ||
        membershipStatus === "MEMBER";

      // ---------------------------------------------------
      // Referral status
      // ---------------------------------------------------

      const referralStatus =
        referral?.status || null;

      // ---------------------------------------------------
      // Determine display status
      // ---------------------------------------------------

      let displayStatus =
        invite.status || "INVITED";

      if (
        invite.status === "CANCELLED"
      ) {
        displayStatus = "CANCELLED";
      } else if (hasMembership) {
        displayStatus = "MEMBER";
      } else if (
        referralStatus ===
        "MEMBERSHIP_PURCHASED"
      ) {
        displayStatus = "MEMBER";
      } else if (
        referralStatus ===
        "FIRST_EXPERIENCE"
      ) {
        displayStatus = "ATTENDED";
      } else if (
        invite.status === "ATTENDED"
      ) {
        displayStatus = "ATTENDED";
      } else if (
        invite.status === "REGISTERED"
      ) {
        displayStatus = "REGISTERED";
      } else {
        displayStatus = "INVITED";
      }

      // ---------------------------------------------------
      // Successful referral
      // ---------------------------------------------------

      const successfulReferral =
        hasMembership ||
        referralStatus ===
          "MEMBERSHIP_PURCHASED";

      // ---------------------------------------------------
      // Invite URL
      // ---------------------------------------------------

      let inviteUrl = null;

      if (invite.shareToken) {
        inviteUrl =
          `${baseUrl}/invite/${invite.shareToken}`;
      }

      // ---------------------------------------------------
      // EVENT
      // ---------------------------------------------------

      let event = null;

      if (
        invite.event &&
        invite.event._id
      ) {
        event = {
          id: invite.event._id.toString(),

          name:
            invite.event.name ||
            invite.event.title ||
            "Purple Experience",

          title:
            invite.event.title ||
            invite.event.name ||
            "Purple Experience",

          date:
            invite.event.date || null,

          time:
            invite.event.time || null,

          location:
            invite.event.location || null,

          image:
            invite.event.image || null,

          status:
            invite.event.status || null,
        };
      }

      // ---------------------------------------------------
      // GUEST
      // ---------------------------------------------------

      let guest = null;

      if (guestMember) {
        guest = {
          id: guestId,

          name:
            guestMember.name || null,

          mobile:
            guestMember.mobile || null,

          membershipStatus,

          isActive:
            guestMember.isActive ?? true,
        };
      }

      // ---------------------------------------------------
      // MEMBERSHIP
      // ---------------------------------------------------

      let membershipData = null;

      if (membership) {
        membershipData = {
          id: membershipId,

          status:
            membership.status || null,

          plan:
            membership.plan || null,

          amount:
            membership.amount || null,

          startedAt:
            membership.startedAt || null,

          createdAt:
            membership.createdAt || null,
        };
      }

      // ---------------------------------------------------
      // REFERRAL
      // ---------------------------------------------------

      let referralData = null;

      if (referral) {
        referralData = {
          id: referralId,

          status:
            referral.status || null,

          firstExperienceAt:
            referral.firstExperienceAt ||
            null,

          membershipPurchasedAt:
            referral.membershipPurchasedAt ||
            null,

          createdAt:
            referral.createdAt || null,
        };
      }

      // ---------------------------------------------------
      // RETURN INVITE
      // ---------------------------------------------------

      return {
        id: inviteId,

        eventId,

        guestUserId:
          invite.guestUserId
            ? invite.guestUserId.toString()
            : null,

        registrationId:
          invite.registrationId
            ? invite.registrationId.toString()
            : null,

        referralId:
          invite.referralId
            ? invite.referralId.toString()
            : referralId,

        guestName:
          invite.guestName ||
          guestMember?.name ||
          "",

        guestMobile:
          invite.guestMobile ||
          guestMember?.mobile ||
          "",

        status: displayStatus,

        originalStatus:
          invite.status || "INVITED",

        successfulReferral,

        event,

        guest,

        membership:
          membershipData,

        referral:
          referralData,

        // Share link
        inviteUrl,

        // Kept for frontend sharing/download if needed
        shareToken:
          invite.shareToken || null,

        createdAt:
          invite.createdAt || null,

        registeredAt:
          invite.registeredAt || null,

        attendedAt:
          invite.attendedAt || null,

        cancelledAt:
          invite.cancelledAt || null,
      };
    });

    // =====================================================
    // SUMMARY
    // =====================================================

    const totalInvites =
      formattedInvites.length;

    const registered =
      formattedInvites.filter(
        (invite) =>
          invite.status === "REGISTERED" ||
          invite.status === "ATTENDED" ||
          invite.status === "MEMBER"
      ).length;

    const attended =
      formattedInvites.filter(
        (invite) =>
          invite.status === "ATTENDED" ||
          invite.status === "MEMBER"
      ).length;

    const successfulReferrals =
      formattedInvites.filter(
        (invite) =>
          invite.successfulReferral
      ).length;

    const cancelled =
      formattedInvites.filter(
        (invite) =>
          invite.status === "CANCELLED"
      ).length;

    const pending =
      formattedInvites.filter(
        (invite) =>
          invite.status === "INVITED" ||
          invite.status === "REGISTERED"
      ).length;

    // =====================================================
    // MILESTONE
    // =====================================================

    let currentMilestone = {
      key: "MEMBER",
      title: "Purple Member",
      threshold: 0,
    };

    if (
      successfulReferrals >= 100
    ) {
      currentMilestone = {
        key: "AMBASSADOR",
        title: "Purple Ambassador",
        threshold: 100,
      };
    } else if (
      successfulReferrals >= 10
    ) {
      currentMilestone = {
        key: "ICON",
        title: "Purple Icon",
        threshold: 10,
      };
    } else if (
      successfulReferrals >= 1
    ) {
      currentMilestone = {
        key: "INSPIRER",
        title: "Purple Inspirer",
        threshold: 1,
      };
    }

    // =====================================================
    // NEXT MILESTONE
    // =====================================================

    let nextMilestone = null;

    if (
      successfulReferrals < 1
    ) {
      nextMilestone = {
        key: "INSPIRER",
        title: "Purple Inspirer",
        threshold: 1,
      };
    } else if (
      successfulReferrals < 10
    ) {
      nextMilestone = {
        key: "ICON",
        title: "Purple Icon",
        threshold: 10,
      };
    } else if (
      successfulReferrals < 100
    ) {
      nextMilestone = {
        key: "AMBASSADOR",
        title: "Purple Ambassador",
        threshold: 100,
      };
    }

    // =====================================================
    // PROGRESS
    // =====================================================

    let progressCurrent =
      successfulReferrals;

    let progressTarget = 1;

    if (
      successfulReferrals < 1
    ) {
      progressTarget = 1;
    } else if (
      successfulReferrals < 10
    ) {
      progressTarget = 10;
    } else if (
      successfulReferrals < 100
    ) {
      progressTarget = 100;
    } else {
      progressTarget = 100;
    }

    const progress =
      progressTarget > 0
        ? Math.min(
            100,
            Math.round(
              (progressCurrent /
                progressTarget) *
                100
            )
          )
        : 100;

    const remaining =
      Math.max(
        0,
        progressTarget -
          successfulReferrals
      );

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      member: {
        id: member._id.toString(),

        name:
          member.name || "",

        mobile:
          member.mobile || "",

        membershipStatus:
          member.membershipStatus ||
          null,
      },

      invites:
        formattedInvites,

      summary: {
        totalInvites,

        registered,

        attended,

        successfulReferrals,

        cancelled,

        pending,
      },

      milestone: {
        current:
          currentMilestone,

        next:
          nextMilestone,

        progress,

        currentCount:
          successfulReferrals,

        target:
          progressTarget,

        remaining,
      },
    });
  } catch (error) {
    console.error(
      "GET USER GUEST INVITES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load your guest invitations.",
      },
      { status: 500 }
    );
  }
}
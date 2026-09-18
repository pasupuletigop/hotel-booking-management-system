const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Room = require("../models/Room");
const RoomBookingLock = require("../models/RoomBookingLock");

// =====================================================
// HELPER: NORMALIZE DATE
// =====================================================

const normalizeDate = (dateString) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    )
  );
};

// =====================================================
// HELPER: CALCULATE NIGHTS
// =====================================================

const calculateNights = (checkIn, checkOut) => {
  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  return Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) /
      millisecondsPerDay
  );
};

// =====================================================
// HELPER: CANCELLATION DEADLINE
// =====================================================

const getCancellationDeadline = (checkIn) => {
  return new Date(
    new Date(checkIn).getTime() -
      24 * 60 * 60 * 1000
  );
};

// =====================================================
// HELPER: POPULATE BOOKING
// =====================================================

const populateBooking = (query) => {
  return query
    .populate(
      "customer",
      "name email role"
    )
    .populate(
      "room",
      "roomNumber roomType capacity pricePerNight amenities description status"
    )
    .populate(
      "cancellationReviewedBy",
      "name email role"
    );
};

// =====================================================
// CREATE BOOKING
// =====================================================

const createBooking = async (
  req,
  res,
  next
) => {
  const session =
    await mongoose.startSession();

  try {
    const {
      room: roomId,
      checkIn,
      checkOut,
      guests,
    } = req.body;

    // -------------------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------------------

    if (
      !roomId ||
      !checkIn ||
      !checkOut ||
      guests === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "room, checkIn, checkOut and guests are required",
      });
    }

    // -------------------------------------------------
    // ROOM ID
    // -------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        roomId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    // -------------------------------------------------
    // DATES
    // -------------------------------------------------

    const startDate =
      normalizeDate(checkIn);

    const endDate =
      normalizeDate(checkOut);

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid check-in or check-out date",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Check-out date must be after check-in date",
      });
    }

    // -------------------------------------------------
    // PREVENT PAST CHECK-IN
    // -------------------------------------------------

    const today = new Date();

    const todayUTC = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
      )
    );

    if (startDate < todayUTC) {
      return res.status(400).json({
        success: false,
        message:
          "Check-in date cannot be in the past",
      });
    }

    // -------------------------------------------------
    // GUESTS
    // -------------------------------------------------

    const guestCount = Number(guests);

    if (
      !Number.isInteger(guestCount) ||
      guestCount < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Number of guests must be a positive integer",
      });
    }

    // -------------------------------------------------
    // START TRANSACTION
    // -------------------------------------------------

    session.startTransaction();

    // -------------------------------------------------
    // ROOM BOOKING LOCK
    // -------------------------------------------------

    let lock;

    const existingLock =
      await RoomBookingLock.findOne({
        room: roomId,
      }).session(session);

    if (!existingLock) {
      try {
        const createdLock =
          await RoomBookingLock.create(
            [
              {
                room: roomId,
              },
            ],
            {
              session,
            }
          );

        lock = createdLock[0];
      } catch (error) {
        if (error.code === 11000) {
          await session.abortTransaction();
          session.endSession();

          return res.status(409).json({
            success: false,
            message:
              "Another booking is currently being processed for this room. Please try again.",
          });
        }

        throw error;
      }
    } else {
      lock = existingLock;
    }

    // Prevent unused-variable lint warnings
    void lock;

    // -------------------------------------------------
    // FIND ROOM
    // -------------------------------------------------

    const room =
      await Room.findById(roomId).session(
        session
      );

    if (!room) {
      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // -------------------------------------------------
    // ROOM STATUS
    // -------------------------------------------------

    if (room.status !== "active") {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message:
          "This room is not currently available for booking",
      });
    }

    // -------------------------------------------------
    // ROOM CAPACITY
    // -------------------------------------------------

    if (guestCount > room.capacity) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: `This room can accommodate a maximum of ${room.capacity} guests`,
      });
    }

    // -------------------------------------------------
    // FINAL AVAILABILITY CHECK
    // -------------------------------------------------

    const conflictingBooking =
      await Booking.findOne({
        room: room._id,

        status: {
          $in: [
            "pending",
            "confirmed",
          ],
        },

        checkIn: {
          $lt: endDate,
        },

        checkOut: {
          $gt: startDate,
        },
      })
        .session(session)
        .lean();

    if (conflictingBooking) {
      await session.abortTransaction();
      session.endSession();

      return res.status(409).json({
        success: false,
        message:
          "Room is already booked for the selected dates",
      });
    }

    // -------------------------------------------------
    // PRICE
    // -------------------------------------------------

    const nights =
      calculateNights(
        startDate,
        endDate
      );

    const pricePerNight =
      room.pricePerNight;

    const totalAmount =
      nights * pricePerNight;

    // -------------------------------------------------
    // CREATE BOOKING
    // -------------------------------------------------

    const createdBookings =
      await Booking.create(
        [
          {
            customer:
              req.user.userId,

            room: room._id,

            checkIn: startDate,

            checkOut: endDate,

            guests: guestCount,

            pricePerNight,

            totalAmount,

            status: "confirmed",

            cancellationRequestStatus:
              "none",
          },
        ],
        {
          session,
        }
      );

    const booking =
      createdBookings[0];

    // -------------------------------------------------
    // COMMIT
    // -------------------------------------------------

    await session.commitTransaction();

    session.endSession();

    // -------------------------------------------------
    // POPULATE
    // -------------------------------------------------

    const populatedBooking =
      await populateBooking(
        Booking.findById(
          booking._id
        )
      );

    return res.status(201).json({
      success: true,
      message:
        "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error(
        "Transaction abort error:",
        abortError.message
      );
    }

    session.endSession();

    console.error(
      "Create booking error:",
      error
    );

    next(error);
  }
};

// =====================================================
// GET MY BOOKINGS
// =====================================================

const getMyBookings = async (
  req,
  res,
  next
) => {
  try {
    const bookings =
      await populateBooking(
        Booking.find({
          customer:
            req.user.userId,
        }).sort({
          createdAt: -1,
        })
      );

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET ALL BOOKINGS
// =====================================================

const getAllBookings = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      search,
      cancellationRequestStatus,
    } = req.query;

    const filter = {};

    // -------------------------------------------------
    // STATUS FILTER
    // -------------------------------------------------

    if (
      status &&
      [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ].includes(status)
    ) {
      filter.status = status;
    }

    // -------------------------------------------------
    // CANCELLATION REQUEST FILTER
    // -------------------------------------------------

    if (
      cancellationRequestStatus &&
      [
        "none",
        "pending",
        "approved",
        "rejected",
      ].includes(
        cancellationRequestStatus
      )
    ) {
      filter.cancellationRequestStatus =
        cancellationRequestStatus;
    }

    // -------------------------------------------------
    // FETCH BOOKINGS
    // -------------------------------------------------

    let bookings =
      await populateBooking(
        Booking.find(filter).sort({
          createdAt: -1,
        })
      );

    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    if (search?.trim()) {
      const searchTerm =
        search
          .trim()
          .toLowerCase();

      bookings =
        bookings.filter(
          (booking) => {
            const customerName =
              booking.customer?.name ||
              "";

            const customerEmail =
              booking.customer?.email ||
              "";

            const roomNumber =
              booking.room?.roomNumber ||
              "";

            const roomType =
              booking.room?.roomType ||
              "";

            const bookingId =
              booking._id?.toString() ||
              "";

            return (
              customerName
                .toLowerCase()
                .includes(
                  searchTerm
                ) ||
              customerEmail
                .toLowerCase()
                .includes(
                  searchTerm
                ) ||
              roomNumber
                .toLowerCase()
                .includes(
                  searchTerm
                ) ||
              roomType
                .toLowerCase()
                .includes(
                  searchTerm
                ) ||
              bookingId
                .toLowerCase()
                .includes(
                  searchTerm
                )
            );
          }
        );
    }

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET SINGLE BOOKING
// =====================================================

const getBookingById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking =
      await populateBooking(
        Booking.findById(id)
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Customer can only see own booking
    if (
      req.user.role === "customer" &&
      booking.customer._id.toString() !==
        req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view this booking",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// DIRECT CANCEL MY BOOKING
// =====================================================
// Allowed only until 24 hours before check-in.
// =====================================================

const cancelMyBooking = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // -------------------------------------------------
    // FIND BOOKING
    // -------------------------------------------------

    const booking =
      await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // -------------------------------------------------
    // OWNERSHIP
    // -------------------------------------------------

    if (
      booking.customer.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only cancel your own bookings",
      });
    }

    // -------------------------------------------------
    // ALREADY CANCELLED
    // -------------------------------------------------

    if (
      booking.status === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking is already cancelled",
      });
    }

    // -------------------------------------------------
    // COMPLETED
    // -------------------------------------------------

    if (
      booking.status === "completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed bookings cannot be cancelled",
      });
    }

    // -------------------------------------------------
    // PENDING REQUEST
    // -------------------------------------------------

    if (
      booking.cancellationRequestStatus ===
      "pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A cancellation request is already pending for this booking",
      });
    }

    // -------------------------------------------------
    // 24-HOUR DEADLINE
    // -------------------------------------------------

    const now = new Date();

    const deadline =
      getCancellationDeadline(
        booking.checkIn
      );

    // Direct cancellation is allowed
    // until the exact 24-hour deadline.
    if (now > deadline) {
      return res.status(409).json({
        success: false,
        code:
          "CANCELLATION_DEADLINE_PASSED",
        message:
          "The 24-hour cancellation deadline has passed. Please submit a cancellation request.",
        cancellationDeadline:
          deadline,
      });
    }

    // -------------------------------------------------
    // CANCEL
    // -------------------------------------------------

    booking.status = "cancelled";

    booking.cancellationRequestStatus =
      "none";

    booking.cancellationReason =
      undefined;

    booking.cancellationRequestedAt =
      undefined;

    await booking.save();

    // -------------------------------------------------
    // UPDATED BOOKING
    // -------------------------------------------------

    const updatedBooking =
      await populateBooking(
        Booking.findById(
          booking._id
        )
      );

    return res.status(200).json({
      success: true,
      action: "cancelled",
      message:
        "Booking cancelled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// REQUEST LATE CANCELLATION
// =====================================================

const requestBookingCancellation =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.params;

      const reason = String(
        req.body?.reason || ""
      ).trim();

      // -------------------------------------------------
      // VALIDATE ID
      // -------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking ID",
        });
      }

      // -------------------------------------------------
      // REASON REQUIRED
      // -------------------------------------------------

      if (!reason) {
        return res.status(400).json({
          success: false,
          message:
            "A cancellation reason is required",
        });
      }

      // -------------------------------------------------
      // REASON LENGTH
      // -------------------------------------------------

      if (reason.length > 500) {
        return res.status(400).json({
          success: false,
          message:
            "Cancellation reason cannot exceed 500 characters",
        });
      }

      // -------------------------------------------------
      // FIND BOOKING
      // -------------------------------------------------

      const booking =
        await Booking.findById(id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }

      // -------------------------------------------------
      // OWNERSHIP
      // -------------------------------------------------

      if (
        booking.customer.toString() !==
        req.user.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only request cancellation for your own bookings",
        });
      }

      // -------------------------------------------------
      // ALREADY CANCELLED
      // -------------------------------------------------

      if (
        booking.status ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Booking is already cancelled",
        });
      }

      // -------------------------------------------------
      // COMPLETED
      // -------------------------------------------------

      if (
        booking.status ===
        "completed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Completed bookings cannot be cancelled",
        });
      }

      // -------------------------------------------------
      // EXISTING REQUEST
      // -------------------------------------------------

      if (
        booking.cancellationRequestStatus ===
        "pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A cancellation request is already pending",
        });
      }

      // -------------------------------------------------
      // CHECK DEADLINE
      // -------------------------------------------------

      const now = new Date();

      const deadline =
        getCancellationDeadline(
          booking.checkIn
        );

      // If still before deadline,
      // direct cancellation is available.
      if (now <= deadline) {
        return res.status(400).json({
          success: false,
          code:
            "DIRECT_CANCELLATION_AVAILABLE",
          message:
            "You can still cancel this booking directly because the 24-hour cancellation deadline has not passed.",
          cancellationDeadline:
            deadline,
        });
      }

      // -------------------------------------------------
      // CREATE REQUEST
      // -------------------------------------------------

      booking.cancellationRequestStatus =
        "pending";

      booking.cancellationReason =
        reason;

      booking.cancellationRequestedAt =
        now;

      booking.cancellationReviewedAt =
        undefined;

      booking.cancellationReviewedBy =
        undefined;

      await booking.save();

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      const updatedBooking =
        await populateBooking(
          Booking.findById(
            booking._id
          )
        );

      return res.status(201).json({
        success: true,
        action:
          "cancellation_requested",
        message:
          "Cancellation request submitted successfully. Staff approval is required.",
        booking: updatedBooking,
      });
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// REVIEW CANCELLATION REQUEST
// ADMIN / RECEPTIONIST
// =====================================================

const reviewCancellationRequest =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.params;

      const { decision } =
        req.body;

      // -------------------------------------------------
      // VALIDATE ID
      // -------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking ID",
        });
      }

      // -------------------------------------------------
      // VALIDATE DECISION
      // -------------------------------------------------

      if (
        ![
          "approve",
          "reject",
        ].includes(decision)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Decision must be approve or reject",
        });
      }

      // -------------------------------------------------
      // FIND BOOKING
      // -------------------------------------------------

      const booking =
        await Booking.findById(id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }

      // -------------------------------------------------
      // CHECK REQUEST
      // -------------------------------------------------

      if (
        booking.cancellationRequestStatus !==
        "pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "There is no pending cancellation request for this booking",
        });
      }

      // -------------------------------------------------
      // ALREADY CANCELLED
      // -------------------------------------------------

      if (
        booking.status ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Booking is already cancelled",
        });
      }

      // -------------------------------------------------
      // COMPLETED
      // -------------------------------------------------

      if (
        booking.status ===
        "completed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Completed bookings cannot be changed",
        });
      }

      const now = new Date();

      // -------------------------------------------------
      // APPROVE
      // -------------------------------------------------

      if (
        decision === "approve"
      ) {
        booking.status =
          "cancelled";

        booking.cancellationRequestStatus =
          "approved";

        booking.cancellationReviewedAt =
          now;

        booking.cancellationReviewedBy =
          req.user.userId;

        await booking.save();

        const updatedBooking =
          await populateBooking(
            Booking.findById(
              booking._id
            )
          );

        return res.status(200).json({
          success: true,
          action:
            "cancelled",
          message:
            "Cancellation request approved and booking cancelled",
          booking:
            updatedBooking,
        });
      }

      // -------------------------------------------------
      // REJECT
      // -------------------------------------------------

      booking.cancellationRequestStatus =
        "rejected";

      booking.cancellationReviewedAt =
        now;

      booking.cancellationReviewedBy =
        req.user.userId;

      await booking.save();

      const updatedBooking =
        await populateBooking(
          Booking.findById(
            booking._id
          )
        );

      return res.status(200).json({
        success: true,
        action:
          "cancellation_request_rejected",
        message:
          "Cancellation request rejected",
        booking:
          updatedBooking,
      });
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// UPDATE BOOKING STATUS
// ADMIN / RECEPTIONIST
// =====================================================

const updateBookingStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.params;

    const { status } =
      req.body;

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking ID",
      });
    }

    // -------------------------------------------------
    // VALID STATUSES
    // -------------------------------------------------

    const allowedStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking status",
      });
    }

    // -------------------------------------------------
    // FIND BOOKING
    // -------------------------------------------------

    const booking =
      await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    // -------------------------------------------------
    // COMPLETED BOOKINGS
    // -------------------------------------------------

    if (
      booking.status ===
        "completed" &&
      status !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed bookings cannot be changed",
      });
    }

    // -------------------------------------------------
    // CANCELLED BOOKINGS
    // -------------------------------------------------

    if (
      booking.status ===
        "cancelled" &&
      status !== "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled bookings cannot be reactivated",
      });
    }

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------

    booking.status =
      status;

    // If staff directly cancels a booking
    // while a request is pending,
    // consider that request approved.
    if (
      status === "cancelled" &&
      booking.cancellationRequestStatus ===
        "pending"
    ) {
      booking.cancellationRequestStatus =
        "approved";

      booking.cancellationReviewedAt =
        new Date();

      booking.cancellationReviewedBy =
        req.user.userId;
    }

    await booking.save();

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    const updatedBooking =
      await populateBooking(
        Booking.findById(
          booking._id
        )
      );

    return res.status(200).json({
      success: true,
      message:
        "Booking status updated successfully",
      booking:
        updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelMyBooking,
  requestBookingCancellation,
  reviewCancellationRequest,
  updateBookingStatus,
};
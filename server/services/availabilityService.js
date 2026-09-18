const Booking = require("../models/Booking");
const Room = require("../models/Room");

// =====================================================
// NORMALIZE DATE
// =====================================================

const normalizeDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);

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
// VALIDATE DATE RANGE
// =====================================================

const validateDateRange = (checkIn, checkOut) => {
  const startDate = normalizeDate(checkIn);
  const endDate = normalizeDate(checkOut);

  if (!startDate || !endDate) {
    return {
      valid: false,
      message: "Invalid check-in or check-out date",
    };
  }

  if (startDate >= endDate) {
    return {
      valid: false,
      message: "Check-out date must be after check-in date",
    };
  }

  return {
    valid: true,
    startDate,
    endDate,
  };
};

// =====================================================
// CHECK-IN CANNOT BE IN THE PAST
// =====================================================

const validateFutureCheckIn = (startDate) => {
  const today = new Date();

  const todayUTC = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    )
  );

  if (startDate < todayUTC) {
    return {
      valid: false,
      message: "Check-in date cannot be in the past",
    };
  }

  return {
    valid: true,
  };
};

// =====================================================
// CALCULATE NUMBER OF NIGHTS
// =====================================================

const calculateNights = (checkIn, checkOut) => {
  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  const difference =
    checkOut.getTime() -
    checkIn.getTime();

  return Math.ceil(
    difference / millisecondsPerDay
  );
};

// =====================================================
// FIND CONFLICTING BOOKING
//
// Conflict rule:
//
// existing.checkIn < requested.checkOut
// AND
// existing.checkOut > requested.checkIn
//
// Only pending and confirmed bookings block rooms.
// =====================================================

const findConflictingBooking = async ({
  roomId,
  checkIn,
  checkOut,
  session = null,
}) => {
  const query = Booking.findOne({
    room: roomId,

    status: {
      $in: ["pending", "confirmed"],
    },

    checkIn: {
      $lt: checkOut,
    },

    checkOut: {
      $gt: checkIn,
    },
  });

  if (session) {
    query.session(session);
  }

  return query.lean();
};

// =====================================================
// CHECK WHETHER ROOM IS AVAILABLE
// =====================================================

const checkRoomAvailability = async ({
  roomId,
  checkIn,
  checkOut,
  guests,
  session = null,
}) => {
  // ---------------------------------------------------
  // Validate room ID indirectly through database query
  // ---------------------------------------------------

  const roomQuery = Room.findById(roomId);

  if (session) {
    roomQuery.session(session);
  }

  const room = await roomQuery;

  if (!room) {
    return {
      available: false,
      status: 404,
      message: "Room not found",
    };
  }

  // ---------------------------------------------------
  // Room status
  // ---------------------------------------------------

  if (room.status !== "active") {
    return {
      available: false,
      status: 400,
      message:
        "This room is not currently available for booking",
    };
  }

  // ---------------------------------------------------
  // Validate guests
  // ---------------------------------------------------

  const guestCount = Number(guests);

  if (
    !Number.isInteger(guestCount) ||
    guestCount < 1
  ) {
    return {
      available: false,
      status: 400,
      message:
        "Number of guests must be a positive integer",
    };
  }

  if (guestCount > room.capacity) {
    return {
      available: false,
      status: 400,
      message:
        `This room can accommodate a maximum of ${room.capacity} guests`,
    };
  }

  // ---------------------------------------------------
  // Validate dates
  // ---------------------------------------------------

  const dateValidation =
    validateDateRange(
      checkIn,
      checkOut
    );

  if (!dateValidation.valid) {
    return {
      available: false,
      status: 400,
      message: dateValidation.message,
    };
  }

  const {
    startDate,
    endDate,
  } = dateValidation;

  // ---------------------------------------------------
  // Check past date
  // ---------------------------------------------------

  const futureValidation =
    validateFutureCheckIn(startDate);

  if (!futureValidation.valid) {
    return {
      available: false,
      status: 400,
      message: futureValidation.message,
    };
  }

  // ---------------------------------------------------
  // Check booking overlap
  // ---------------------------------------------------

  const conflictingBooking =
    await findConflictingBooking({
      roomId: room._id,
      checkIn: startDate,
      checkOut: endDate,
      session,
    });

  if (conflictingBooking) {
    return {
      available: false,
      status: 409,
      message:
        "Room is already booked for the selected dates",
      conflictingBooking,
    };
  }

  // ---------------------------------------------------
  // Available
  // ---------------------------------------------------

  return {
    available: true,
    status: 200,
    room,
    startDate,
    endDate,
    nights: calculateNights(
      startDate,
      endDate
    ),
  };
};

// =====================================================
// GET AVAILABLE ROOMS
// =====================================================

const getAvailableRooms = async ({
  checkIn,
  checkOut,
  guests,
}) => {
  // ---------------------------------------------------
  // Validate dates
  // ---------------------------------------------------

  const dateValidation =
    validateDateRange(
      checkIn,
      checkOut
    );

  if (!dateValidation.valid) {
    const error = new Error(
      dateValidation.message
    );

    error.statusCode = 400;

    throw error;
  }

  const {
    startDate,
    endDate,
  } = dateValidation;

  // ---------------------------------------------------
  // Prevent past dates
  // ---------------------------------------------------

  const futureValidation =
    validateFutureCheckIn(startDate);

  if (!futureValidation.valid) {
    const error = new Error(
      futureValidation.message
    );

    error.statusCode = 400;

    throw error;
  }

  // ---------------------------------------------------
  // Validate guests
  // ---------------------------------------------------

  const guestCount = Number(guests);

  if (
    !Number.isInteger(guestCount) ||
    guestCount < 1
  ) {
    const error = new Error(
      "Number of guests must be a positive integer"
    );

    error.statusCode = 400;

    throw error;
  }

  // ---------------------------------------------------
  // Find active rooms with enough capacity
  // ---------------------------------------------------

  const rooms = await Room.find({
    status: "active",
    capacity: {
      $gte: guestCount,
    },
  })
    .sort({
      roomNumber: 1,
    })
    .lean();

  if (rooms.length === 0) {
    return [];
  }

  // ---------------------------------------------------
  // Find all bookings overlapping requested dates
  // ---------------------------------------------------

  const blockedBookings =
    await Booking.find({
      room: {
        $in: rooms.map(
          (room) => room._id
        ),
      },

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
      .select("room checkIn checkOut status")
      .lean();

  // ---------------------------------------------------
  // Create set of blocked room IDs
  // ---------------------------------------------------

  const blockedRoomIds =
    new Set(
      blockedBookings.map(
        (booking) =>
          booking.room.toString()
      )
    );

  // ---------------------------------------------------
  // Return only available rooms
  // ---------------------------------------------------

  return rooms.filter(
    (room) =>
      !blockedRoomIds.has(
        room._id.toString()
      )
  );
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  normalizeDate,
  validateDateRange,
  validateFutureCheckIn,
  calculateNights,
  findConflictingBooking,
  checkRoomAvailability,
  getAvailableRooms,
};
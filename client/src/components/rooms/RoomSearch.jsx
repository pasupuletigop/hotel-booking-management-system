import { useState } from "react";
import {
  CalendarDays,
  Users,
  Search,
  LoaderCircle,
} from "lucide-react";

import { getAvailableRooms } from "../../services/roomService";

const RoomSearch = ({ onResults }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (event) => {
    event.preventDefault();

    setError("");

    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    if (Number(guests) < 1) {
      setError("At least one guest is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await getAvailableRooms({
        checkIn,
        checkOut,
        guests: Number(guests),
      });

      onResults(response?.rooms || response?.data || []);

    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to search rooms. Please try again."
      );

      onResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="modern-room-search"
      onSubmit={handleSearch}
    >

      <div className="search-field">

        <div className="search-field-icon">
          <CalendarDays size={19} />
        </div>

        <div className="search-field-content">

          <label htmlFor="checkIn">
            CHECK-IN
          </label>

          <input
            id="checkIn"
            type="date"
            value={checkIn}
            onChange={(event) =>
              setCheckIn(event.target.value)
            }
            min={new Date().toISOString().split("T")[0]}
          />

        </div>

      </div>


      <div className="search-field">

        <div className="search-field-icon">
          <CalendarDays size={19} />
        </div>

        <div className="search-field-content">

          <label htmlFor="checkOut">
            CHECK-OUT
          </label>

          <input
            id="checkOut"
            type="date"
            value={checkOut}
            onChange={(event) =>
              setCheckOut(event.target.value)
            }
            min={
              checkIn ||
              new Date().toISOString().split("T")[0]
            }
          />

        </div>

      </div>


      <div className="search-field">

        <div className="search-field-icon">
          <Users size={19} />
        </div>

        <div className="search-field-content">

          <label htmlFor="guests">
            GUESTS
          </label>

          <select
            id="guests"
            value={guests}
            onChange={(event) =>
              setGuests(event.target.value)
            }
          >
            <option value={1}>1 Guest</option>
            <option value={2}>2 Guests</option>
            <option value={3}>3 Guests</option>
            <option value={4}>4 Guests</option>
            <option value={5}>5 Guests</option>
            <option value={6}>6 Guests</option>
            <option value={7}>7 Guests</option>
            <option value={8}>8 Guests</option>
          </select>

        </div>

      </div>


      <button
        type="submit"
        className="search-submit-button"
        disabled={loading}
      >
        {loading ? (
          <>
            <LoaderCircle
              size={19}
              className="spin"
            />
            Searching...
          </>
        ) : (
          <>
            <Search size={19} />
            Search Rooms
          </>
        )}
      </button>


      {error && (
        <div className="room-search-error">
          {error}
        </div>
      )}

    </form>
  );
};

export default RoomSearch;
import {
  BedDouble,
  Filter,
  Search,
  SlidersHorizontal,
  Users,
  Wifi,
  Wind,
  Coffee,
  Car,
  Waves,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAvailableRooms,
} from "../services/roomService";

const SearchRooms = () => {
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  const [priceFilter, setPriceFilter] =
    useState("all");

  const [roomType, setRoomType] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("recommended");

  const [amenities, setAmenities] = useState([]);

  const handleAmenityChange = (amenity) => {
    setAmenities((current) =>
      current.includes(amenity)
        ? current.filter(
            (item) => item !== amenity
          )
        : [...current, amenity]
    );
  };

  const handleSearch = async (event) => {
    event?.preventDefault();

    setError("");

    if (!checkIn || !checkOut) {
      setError(
        "Please select both check-in and check-out dates."
      );
      return;
    }

    if (checkIn >= checkOut) {
      setError(
        "Check-out must be after check-in."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await getAvailableRooms({
          checkIn,
          checkOut,
          guests,
        });

      setRooms(
        response?.rooms ||
          response?.data ||
          []
      );

      setSearched(true);
    } catch (err) {
      setRooms([]);

      setError(
        err?.response?.data?.message ||
          "Unable to find available rooms."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    let result = [...rooms];

    if (roomType !== "all") {
      result = result.filter(
        (room) =>
          String(room.type || room.roomType)
            .toLowerCase() ===
          roomType.toLowerCase()
      );
    }

    if (priceFilter !== "all") {
      result = result.filter((room) => {
        const price =
          Number(
            room.price ||
              room.pricePerNight ||
              0
          );

        if (priceFilter === "budget") {
          return price < 3000;
        }

        if (priceFilter === "mid") {
          return (
            price >= 3000 &&
            price <= 6000
          );
        }

        if (priceFilter === "luxury") {
          return price > 6000;
        }

        return true;
      });
    }

    if (amenities.length > 0) {
      result = result.filter((room) => {
        const roomAmenities =
          room.amenities || [];

        return amenities.every((wanted) =>
          roomAmenities.some(
            (item) =>
              String(item).toLowerCase() ===
              wanted.toLowerCase()
          )
        );
      });
    }

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    return result;
  }, [
    rooms,
    priceFilter,
    roomType,
    sortBy,
    amenities,
  ]);

  const clearFilters = () => {
    setPriceFilter("all");
    setRoomType("all");
    setAmenities([]);
  };

  const getRoomPrice = (room) =>
    Number(
      room.price ||
        room.pricePerNight ||
        0
    );

  const getRoomName = (room) =>
    room.name ||
    room.roomType ||
    room.type ||
    "Guest Room";

  const getRoomImage = (room) =>
    room.image ||
    room.imageUrl ||
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=85";

  const getRoomGuests = (room) =>
    room.capacity ||
    room.maxGuests ||
    room.guests ||
    2;

  useEffect(() => {
    // Intentionally empty.
    // Availability is requested only after
    // the customer submits the search form.
  }, []);

  return (
    <div className="search-rooms-page">
      {/* Header */}
      <div className="rooms-page-heading">
        <div>
          <span className="page-header-eyebrow">
            GRAND PALACE HOTEL
          </span>

          <h1>Find your perfect room</h1>

          <p>
            Choose from elegant rooms and suites
            designed for an exceptional stay.
          </p>
        </div>
      </div>

      {/* Search panel */}
      <form
        className="room-search-panel"
        onSubmit={handleSearch}
      >
        <div className="room-search-field">
          <label>CHECK-IN</label>

          <input
            type="date"
            value={checkIn}
            onChange={(event) =>
              setCheckIn(event.target.value)
            }
          />
        </div>

        <div className="room-search-field">
          <label>CHECK-OUT</label>

          <input
            type="date"
            value={checkOut}
            onChange={(event) =>
              setCheckOut(event.target.value)
            }
          />
        </div>

        <div className="room-search-field">
          <label>GUESTS</label>

          <div className="guest-input">
            <Users size={16} />

            <select
              value={guests}
              onChange={(event) =>
                setGuests(
                  Number(event.target.value)
                )
              }
            >
              <option value={1}>
                1 Guest
              </option>

              <option value={2}>
                2 Guests
              </option>

              <option value={3}>
                3 Guests
              </option>

              <option value={4}>
                4 Guests
              </option>

              <option value={5}>
                5+ Guests
              </option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="room-search-submit"
          disabled={loading}
        >
          <Search size={18} />

          {loading
            ? "Searching..."
            : "Search rooms"}
        </button>
      </form>

      {error && (
        <div className="rooms-error">
          <span>!</span>
          {error}
        </div>
      )}

      {/* Results area */}
      <div className="rooms-results-layout">
        {/* Filters */}
        <aside
          className={`rooms-filter-sidebar ${
            mobileFiltersOpen
              ? "rooms-filter-mobile-open"
              : ""
          }`}
        >
          <div className="rooms-filter-header">
            <div>
              <span>REFINE</span>
              <h2>Filters</h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(false)
              }
              className="rooms-filter-close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="filter-group">
            <span className="filter-label">
              PRICE PER NIGHT
            </span>

            <label className="filter-radio">
              <input
                type="radio"
                checked={
                  priceFilter === "all"
                }
                onChange={() =>
                  setPriceFilter("all")
                }
              />

              <span>All prices</span>
            </label>

            <label className="filter-radio">
              <input
                type="radio"
                checked={
                  priceFilter === "budget"
                }
                onChange={() =>
                  setPriceFilter("budget")
                }
              />

              <span>Under ₹3,000</span>
            </label>

            <label className="filter-radio">
              <input
                type="radio"
                checked={
                  priceFilter === "mid"
                }
                onChange={() =>
                  setPriceFilter("mid")
                }
              />

              <span>₹3,000 – ₹6,000</span>
            </label>

            <label className="filter-radio">
              <input
                type="radio"
                checked={
                  priceFilter === "luxury"
                }
                onChange={() =>
                  setPriceFilter("luxury")
                }
              />

              <span>Above ₹6,000</span>
            </label>
          </div>

          <div className="filter-group">
            <span className="filter-label">
              ROOM TYPE
            </span>

            {[
              "all",
              "standard",
              "deluxe",
              "suite",
            ].map((type) => (
              <label
                className="filter-radio"
                key={type}
              >
                <input
                  type="radio"
                  checked={
                    roomType === type
                  }
                  onChange={() =>
                    setRoomType(type)
                  }
                />

                <span>
                  {type === "all"
                    ? "All rooms"
                    : type.charAt(0).toUpperCase() +
                      type.slice(1)}
                </span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <span className="filter-label">
              AMENITIES
            </span>

            {[
              {
                id: "wifi",
                label: "Free Wi-Fi",
                icon: Wifi,
              },
              {
                id: "air conditioning",
                label: "Air conditioning",
                icon: Wind,
              },
              {
                id: "breakfast",
                label: "Breakfast",
                icon: Coffee,
              },
              {
                id: "parking",
                label: "Parking",
                icon: Car,
              },
              {
                id: "pool",
                label: "Swimming pool",
                icon: Waves,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <label
                  className="filter-checkbox"
                  key={item.id}
                >
                  <input
                    type="checkbox"
                    checked={amenities.includes(
                      item.id
                    )}
                    onChange={() =>
                      handleAmenityChange(
                        item.id
                      )
                    }
                  />

                  <span className="custom-checkbox">
                    ✓
                  </span>

                  <Icon size={14} />

                  <span>
                    {item.label}
                  </span>
                </label>
              );
            })}
          </div>

          <button
            type="button"
            className="clear-filters-button"
            onClick={clearFilters}
          >
            Clear all filters
          </button>
        </aside>

        {/* Results */}
        <section className="rooms-results">
          <div className="rooms-results-toolbar">
            <div>
              <span className="rooms-result-count">
                {searched
                  ? `${filteredRooms.length} ${
                      filteredRooms.length === 1
                        ? "room"
                        : "rooms"
                    } available`
                  : "Available rooms"}
              </span>

              {searched && (
                <small>
                  {checkIn} → {checkOut}
                </small>
              )}
            </div>

            <div className="rooms-toolbar-actions">
              <button
                type="button"
                className="mobile-filter-button"
                onClick={() =>
                  setMobileFiltersOpen(true)
                }
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>

              <label className="room-sort">
                <span>Sort by</span>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value
                    )
                  }
                >
                  <option value="recommended">
                    Recommended
                  </option>

                  <option value="price-low">
                    Price: low to high
                  </option>

                  <option value="price-high">
                    Price: high to low
                  </option>
                </select>
              </label>
            </div>
          </div>

          {!searched && !loading ? (
            <div className="rooms-initial-state">
              <div className="rooms-initial-icon">
                <BedDouble size={30} />
              </div>

              <h2>
                Your perfect room awaits
              </h2>

              <p>
                Select your dates and number of
                guests above to discover available
                rooms at Grand Palace.
              </p>
            </div>
          ) : loading ? (
            <div className="rooms-loading">
              <div className="loading-spinner" />

              <span>
                Finding the best rooms for you...
              </span>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="rooms-no-results">
              <div>
                <Filter size={24} />
              </div>

              <h2>
                No rooms found
              </h2>

              <p>
                Try changing your dates or
                adjusting your filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="rooms-grid">
              {filteredRooms.map((room) => {
                const roomId =
                  room._id || room.id;

                return (
                  <article
                    className="luxury-room-card"
                    key={roomId}
                  >
                    <div className="luxury-room-image">
                      <img
                        src={getRoomImage(room)}
                        alt={getRoomName(room)}
                      />

                      <span className="room-available-badge">
                        Available
                      </span>
                    </div>

                    <div className="luxury-room-content">
                      <div className="luxury-room-title-row">
                        <div>
                          <span>
                            GRAND PALACE
                          </span>

                          <h2>
                            {getRoomName(room)}
                          </h2>
                        </div>

                        <div className="room-rating">
                          ★ 4.9
                        </div>
                      </div>

                      <div className="room-meta">
                        <span>
                          <Users size={14} />
                          {getRoomGuests(room)} guests
                        </span>

                        <span>
                          <BedDouble size={14} />
                          Premium bed
                        </span>
                      </div>

                      <div className="room-card-bottom">
                        <div className="room-price">
                          <strong>
                            ₹
                            {getRoomPrice(
                              room
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          <span>
                            / night
                          </span>
                        </div>

                        <button
  type="button"
  className="room-view-button"
  onClick={() =>
    navigate("/book-room", {
      state: {
        room,
        checkIn,
        checkOut,
        guests,
      },
    })
  }
>
  Select room
</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SearchRooms;
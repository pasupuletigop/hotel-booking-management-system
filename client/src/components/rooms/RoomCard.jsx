import {
  BedDouble,
  Users,
  Wifi,
  Car,
  Dumbbell,
  Utensils,
  ArrowRight,
} from "lucide-react";

const RoomCard = ({ room, onBook }) => {
  const roomImages = {
    single:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",

    double:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",

    twin:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",

    suite:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",

    deluxe:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80",
  };

  const roomType = room?.roomType || "double";

  const image =
    roomImages[roomType] || roomImages.double;

  const getAmenityIcon = (amenity) => {
    const value = String(amenity).toLowerCase();

    if (value.includes("wifi")) {
      return <Wifi size={15} />;
    }

    if (value.includes("parking")) {
      return <Car size={15} />;
    }

    if (
      value.includes("gym") ||
      value.includes("fitness")
    ) {
      return <Dumbbell size={15} />;
    }

    if (
      value.includes("restaurant") ||
      value.includes("food")
    ) {
      return <Utensils size={15} />;
    }

    return <BedDouble size={15} />;
  };

  const formattedRoomType =
    roomType.charAt(0).toUpperCase() +
    roomType.slice(1);

  const price = Number(room?.pricePerNight || 0);

  return (
    <article className="room-card">

      {/* Room Image */}
      <div className="room-card-image-wrapper">

        <img
          src={image}
          alt={`${formattedRoomType} room`}
          className="room-card-image"
        />

        <div className="room-card-image-overlay" />

        <span className="room-type-badge">
          {formattedRoomType}
        </span>

        <span className="room-available-badge">
          Available
        </span>

      </div>


      {/* Room Information */}
      <div className="room-card-content">

        <div className="room-card-title-row">

          <div>
            <h3>
              {formattedRoomType} Room
            </h3>

            <p className="room-number">
              Room {room?.roomNumber || "N/A"}
            </p>
          </div>

          <div className="room-capacity">
            <Users size={16} />

            <span>
              {room?.capacity || 1} Guests
            </span>
          </div>

        </div>


        {/* Description */}
        {room?.description && (
          <p className="room-description">
            {room.description}
          </p>
        )}


        {/* Amenities */}
        {Array.isArray(room?.amenities) &&
          room.amenities.length > 0 && (
            <div className="room-amenities">

              {room.amenities
                .slice(0, 3)
                .map((amenity, index) => (
                  <span
                    className="room-amenity"
                    key={`${amenity}-${index}`}
                  >
                    {getAmenityIcon(amenity)}

                    {amenity}
                  </span>
                ))}

              {room.amenities.length > 3 && (
                <span className="room-more-amenities">
                  +{room.amenities.length - 3}
                </span>
              )}

            </div>
          )}


        {/* Price and Book Button */}
        <div className="room-card-footer">

          <div className="room-price">

            <strong>
              ₹{price.toLocaleString("en-IN")}
            </strong>

            <span>
              per night
            </span>

          </div>


          <button
            type="button"
            className="room-book-button"
            onClick={() => onBook(room)}
          >
            Book Now

            <ArrowRight size={17} />

          </button>

        </div>

      </div>

    </article>
  );
};

export default RoomCard;
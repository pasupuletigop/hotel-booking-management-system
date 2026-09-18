import {
  Hotel,
  MapPin,
  Phone,
  Mail,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Brand */}
        <div className="footer-section footer-brand">

          <div className="footer-logo">
            <div className="footer-logo-icon">
              <Hotel size={23} />
            </div>

            <div>
              <h2>Grand Palace</h2>
              <span>Hotel & Resort</span>
            </div>
          </div>

          <p>
            Experience comfort, elegance and exceptional hospitality
            at Grand Palace Hotel. Your perfect stay begins here.
          </p>

          <div className="footer-contact">

            <div>
              <MapPin size={17} />
              <span>MG Road, Hyderabad, Telangana</span>
            </div>

            <div>
              <Phone size={17} />
              <span>+91 98765 43210</span>
            </div>

            <div>
              <Mail size={17} />
              <span>info@grandpalacehotel.com</span>
            </div>

          </div>

        </div>

        {/* Quick Links */}
        <div className="footer-section">

          <h3>Quick Links</h3>

          <ul>
            <li>Home</li>
            <li>Rooms</li>
            <li>My Bookings</li>
            <li>About Us</li>
            <li>Contact</li>
          </ul>

        </div>

        {/* Amenities */}
        <div className="footer-section">

          <h3>Our Facilities</h3>

          <ul className="footer-facilities">

            <li>
              <Wifi size={16} />
              Free Wi-Fi
            </li>

            <li>
              <Car size={16} />
              Free Parking
            </li>

            <li>
              <Utensils size={16} />
              Restaurant
            </li>

            <li>
              <Dumbbell size={16} />
              Fitness Center
            </li>

          </ul>

        </div>

        {/* Hotel Information */}
        <div className="footer-section">

          <h3>Stay With Us</h3>

          <p className="footer-description">
            Discover beautifully designed rooms, premium amenities
            and warm hospitality for a memorable stay.
          </p>

          <div className="footer-rating">
            <span>★★★★★</span>
            <small> Premium Hospitality</small>
          </div>

        </div>

      </div>

      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} Grand Palace Hotel & Resort.
          All rights reserved.
        </p>

        <div>
          <span>Privacy Policy</span>
          <span>Terms & Conditions</span>
        </div>

      </div>

    </footer>
  );
};

export default Footer;
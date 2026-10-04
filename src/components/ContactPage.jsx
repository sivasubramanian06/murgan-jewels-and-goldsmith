import { MapPin, Phone, Clock3, MessageCircle } from "lucide-react";
import logo from "../assets/murugan-logo.jpeg";

export default function ContactPage() {
  return (
    <main className="page-enter contact-page">
      <section className="contact-hero">
        <img
          src={logo}
          alt="Murugan Goldsmith and Jewels"
          className="contact-logo"
        />

        <div>
          <p className="eyebrow">Visit our shop</p>

          <h1 className="display-font">
            Contact Us
          </h1>

          <p className="contact-intro">
            For jewellery enquiries, custom orders, goldsmith work
            and delivery updates, contact us directly.
          </p>
        </div>
      </section>

      <section className="contact-grid">

        {/* PHONE */}
        <a
          className="contact-card hover-lift"
          href="tel:+919789481246"
        >
          <span className="contact-icon">
            <Phone size={20} />
          </span>

          <div>
            <h2>Call Us</h2>
            <p>97894 81246</p>
            <small>Tap to call the shop</small>
          </div>
        </a>


        {/* WHATSAPP BUSINESS */}
        <a
          className="contact-card hover-lift"
          href="https://wa.me/919384741246"
          target="_blank"
          rel="noreferrer"
        >
          <span className="contact-icon">
            <MessageCircle size={20} />
          </span>

          <div>
            <h2>WhatsApp Business</h2>
            <p>93847 41246</p>
            <small>Message us for enquiries</small>
          </div>
        </a>


        {/* LOCATION */}
        <div className="contact-card hover-lift">
          <span className="contact-icon">
            <MapPin size={20} />
          </span>

          <div>
            <h2>Visit Us</h2>
            <p>Kuruvikulam</p>
            <small>
              Murugan Goldsmith and Jewels
            </small>
          </div>
        </div>


        {/* SHOP HOURS */}
        <div className="contact-card hover-lift">
          <span className="contact-icon">
            <Clock3 size={20} />
          </span>

          <div>
            <h2>Shop Hours</h2>
            <p>Contact us for today's hours</p>
            <small>
              Hours can be updated from this page later
            </small>
          </div>
        </div>

      </section>


      <section className="contact-note">
        <h2 className="display-font">
          Custom Jewellery Orders
        </h2>

        <p>
          Bring your design or requirements to the shop.
          We can record your order, assign a goldsmith,
          track progress and schedule delivery through the
          Admin system.
        </p>
      </section>

    </main>
  );
}
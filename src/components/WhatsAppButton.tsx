import React from "react";
import "./WhatsAppButton.css";
import { FaWhatsapp } from "react-icons/fa";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

const WhatsAppButton: React.FC = () => {
  const phoneNumber = "919505261283"; 
  const defaultMessage = encodeURIComponent("Hi Assure Technologies, I need help with...");

  const handleClick = async () => {
    const url = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url });
        return;
      } catch (err) {
        console.warn("Capacitor Browser open failed, falling back to window.open", err);
      }
    }
    window.open(url, "_blank");
  };

  return (
    <button className="whatsapp-fab" onClick={handleClick} aria-label="Chat on WhatsApp">
      <FaWhatsapp className="whatsapp-icon" />
    </button>
  );
};

export default WhatsAppButton;

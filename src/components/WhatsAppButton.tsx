import React from "react";
import "./WhatsAppButton.css";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton: React.FC = () => {
  // Assuming Assure uses the same or similar logic, update number if needed
  const phoneNumber = "919346436577"; 
  const defaultMessage = encodeURIComponent("Hi Assure Technologies, I need help with...");

  const handleClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${defaultMessage}`, "_blank");
  };

  return (
    <button className="whatsapp-fab" onClick={handleClick} aria-label="Chat on WhatsApp">
      <FaWhatsapp className="whatsapp-icon" />
    </button>
  );
};

export default WhatsAppButton;

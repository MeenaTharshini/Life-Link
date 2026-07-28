import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Droplets,
  MapPin,
  Phone,
  Syringe,
  Clock3,
  X,
} from "lucide-react";

import "./EmergencyPopup.css";

export default function EmergencyPopup({
  notification,
  onAccept,
  onClose,
}) {
  const [seconds, setSeconds] = useState(60);

  // Countdown Timer
  useEffect(() => {
    if (!notification) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [notification]);

  // Alarm Sound
  useEffect(() => {
    if (!notification) return;

    const audio = new Audio("/sounds/emergency.mp3");

    audio.loop = true;

    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [notification]);

  if (!notification) return null;

  return (
    <div className="emergency-overlay">
      <div className="emergency-popup">

        <button
          className="close-btn"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <div className="popup-header">

          <AlertTriangle
            size={42}
            className="danger-icon"
          />

          <h1>EMERGENCY BLOOD REQUEST</h1>

          <p>
            Nearby patient requires immediate blood.
          </p>

        </div>

        <div className="timer-circle">

          <Clock3 size={28} />

          <span>{seconds}s</span>

        </div>

        <div className="popup-info">

          <div className="row">
            <Droplets size={18} />
            <strong>
              Blood Group:
            </strong>
            {notification.blood_group}
          </div>

          <div className="row">
            <Syringe size={18} />
            <strong>Units:</strong>
            {notification.units}
          </div>

          <div className="row">
            <MapPin size={18} />
            {notification.address}
          </div>

          <div className="row">
            <Phone size={18} />
            {notification.requester_phone}
          </div>

        </div>

        <div className="popup-buttons">

          <button
            className="accept-btn"
            onClick={() => onAccept(notification)}
          >
            I'll Donate
          </button>

          <button
            className="later-btn"
            onClick={onClose}
          >
            Later
          </button>

        </div>

      </div>
    </div>
  );
}
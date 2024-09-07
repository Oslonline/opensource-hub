import { useEffect } from "react";

interface NotificationProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`fixed bottom-5 w-fit left-1/2 -translate-x-1/2 transform rounded-md px-4 py-2 text-zinc-100 ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>
      <p className="break-keep text-center">{message}</p>
    </div>
  );
};

export default Notification;

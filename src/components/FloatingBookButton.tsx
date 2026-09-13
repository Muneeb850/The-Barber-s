import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import { useBooking } from "@/components/booking/BookingContext";

export function FloatingBookButton() {
  const { openBooking, open } = useBooking();

  return (
    <motion.button
      type="button"
      onClick={() => openBooking()}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: open ? 0 : 1, y: open ? 24 : 0 }}
      transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      className="fixed right-5 bottom-5 z-40 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3.5 text-[0.68rem] font-bold tracking-[0.2em] text-white uppercase shadow-[0_8px_25px_-4px_rgba(220,38,38,0.6)] transition-all duration-300 hover:bg-red-700 hover:shadow-[0_12px_30px_-4px_rgba(220,38,38,0.8)] active:scale-95 cursor-pointer"
    >
      <CalendarCheck className="size-4" aria-hidden="true" />
      Book Now
    </motion.button>
  );
}

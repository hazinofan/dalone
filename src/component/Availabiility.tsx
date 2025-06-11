
'use client';
import { useEffect, useState } from "react";
import { addDays, format, startOfWeek, isToday } from "date-fns";
import { motion } from "framer-motion";
import { getAvailableSlots } from "../../core/services/reservations";
import { useRouter } from "next/router";
import { Clock } from "lucide-react";

type Slot = {
  time: string;
  reserved: boolean;
};

type Props = {
  professionalId?: any;
};

export const HorizontalTimeline = ({ professionalId }: Props) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [slotsByDate, setSlotsByDate] = useState<Record<string, Slot[]>>({});
  const router = useRouter();
  const [id, setId] = useState<any>(null);
  const startDate = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7);
  const weekStartStr = format(startDate, "yyyy-MM-dd");

  useEffect(() => {
    if (professionalId) {
      setId(String(professionalId));
    } else if (router.isReady && typeof router.query.id === 'string') {
      setId(router.query.id);
    }
  }, [router.isReady, professionalId]);

  useEffect(() => {
    if (!id) return;
    getAvailableSlots(id, weekStartStr)
      .then(data => {
        const result: Record<string, Slot[]> = {};
        Object.entries(data).forEach(([date, slotList]) => {
          result[date] = slotList.map(raw => {
            const isReserved = raw.endsWith("*");     // true only when backend marked it
            return {
              time: raw.replace("*", ""),
              reserved: isReserved,
            };
          });
        });
        setSlotsByDate(result);
      })
      .catch(console.error);
  }, [id, weekOffset]);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(startDate, i);
    const iso = format(date, "yyyy-MM-dd");
    return {
      date,
      label: format(date, "EEE d"),
      isToday: isToday(date),
      slots: slotsByDate[iso] || [],
    };
  });

  const timeHeaders = Array.from({ length: 13 }).map((_, i) => {
    const hour = i + 8;
    return `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
  });

  return (
    <div className="w-full bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-950 to-white">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-blue-100 border border-blue-200 shadow-sm transition"
        >
          <ChevronLeft className="w-5 h-5 text-blue-950" />
          <span className="text-blue-950 font-medium text-sm">Previous</span>
        </button>

        <h2 className="text-lg font-semibold text-gray-800 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
          {format(startDate, "MMM d")} – {format(addDays(startDate, 6), "MMM d, yyyy")}
        </h2>

        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-blue-100 border border-blue-200 shadow-sm transition"
        >
          <span className="text-blue-950 font-medium text-sm">Next</span>
          <ChevronRight className="w-5 h-5 text-blue-950" />
        </button>
      </div>

      {/* Time header */}
      <div className="overflow-x-auto">
        <div className="flex pl-24 min-w-max sticky top-0 z-20 bg-white border-b border-gray-200">
          {timeHeaders.map((time, i) => (
            <div
              key={i}
              className="w-28 text-center text-xs font-semibold text-gray-400 py-2 border-r border-gray-100"
            >
              {time}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {days.map((day, i) => (
            <div key={i} className="flex min-h-[80px] border-t border-gray-100 relative">
              {/* Day label */}
              <div
                className={`w-24 flex-shrink-0 flex items-center justify-end pr-4 font-medium text-sm relative z-10 ${day.isToday ? "text-blue-950" : "text-gray-500"
                  }`}
              >
                <span className="bg-white px-2">{day.label}</span>
                {day.isToday && <span className="absolute right-4 w-2 h-2 rounded-full bg-blue-900 animate-pulse" />}
              </div>

              {/* Grid lines */}
              <div className="flex-1 relative">
                {/* vertical lines */}
                <div className="absolute inset-0 flex">
                  {timeHeaders.map((_, idx) => (
                    <div key={idx} className="w-28 border-r border-gray-100" />
                  ))}
                </div>
                {/* horizontal lines */}
                <div className="absolute inset-0 flex flex-col">
                  {Array.from({ length: 13 }).map((_, idx) => (
                    <div key={idx} className="h-[60px] border-t border-gray-100" />
                  ))}
                </div>

                {/* Reserved slots */}
                {day.slots
                  .filter(s => s.reserved)
                  .map((slot, j) => {
                    const [h, m] = slot.time.split(":").map(Number);
                    const totalMinutes = h * 60 + m;
                    const left = ((totalMinutes - 8 * 60) / (12 * 60)) * 100;

                    return (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05, zIndex: 30 }}
                        className="absolute top-3 h-14 w-24 rounded-xl border bg-red-100 border-blue-200 shadow-md p-2 flex flex-col justify-center transition-all"
                        style={{ left: `${left}%` }}
                      >
                        <div className="text-xs font-semibold text-red-700 truncate">Reserved</div>
                        <div className="text-[11px] font-normal text-red-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {slot.time}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

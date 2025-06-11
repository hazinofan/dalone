import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getAvailableSlots } from "../../core/services/reservations";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, ChevronDown, Clock } from "lucide-react";

function generateHalfHourSlots(start: string, end: string): string[] {
    const [h0, m0] = start.split(":").map(Number);
    const [h1, m1] = end.split(":").map(Number);
    const slots: string[] = [];
    let h = h0, m = m0;
    while (h < h1 || (h === h1 && m < m1)) {
        slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
        m += 30;
        if (m >= 60) { m = 0; h++; }
    }
    return slots;
}

// Helper: check if any reserved slot lies between start→end
function hasReservedBetween(start: string, end: string, reserved: Set<string>) {
    return generateHalfHourSlots(start, end).some((t) => reserved.has(t));
}

export function DateTimeRangePicker({
    professionalId,
    onChange,
}: {
    professionalId: number;
    onChange: (date: Date, startTime: string, endTime: string) => void;
}) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [reservedSlots, setReservedSlots] = useState<Set<string>>(new Set());
    const [startTime, setStartTime] = useState<string | null>(null);
    const [endTime, setEndTime] = useState<string | null>(null);

    // 1️⃣ Fetch reserved slots on date change
    useEffect(() => {
        (async () => {
            const iso = format(selectedDate, "yyyy-MM-dd");
            const data = await getAvailableSlots(professionalId, iso);

            // only grab the slots that actually end with '*'
            const reserved = new Set(
                (data[iso] || [])
                    .filter((t) => t.endsWith("*"))     // << only starred ones
                    .map((t) => t.replace("*", ""))      // strip the star
            );

            setReservedSlots(reserved);

            // clear if your selection now conflicts
            if (startTime && reserved.has(startTime)) {
                setStartTime(null);
                setEndTime(null);
            }
        })();
    }, [selectedDate, professionalId]);


    // 2️⃣ Build all half-hour options
    const allTimes: string[] = [];
    for (let h = 8; h <= 20; h++) {
        allTimes.push(`${h.toString().padStart(2, "0")}:00`);
        allTimes.push(`${h.toString().padStart(2, "0")}:30`);
    }

    // 3️⃣ Notify parent when a full range is chosen
    useEffect(() => {
        if (startTime && endTime) {
            onChange(selectedDate, startTime, endTime);
        }
    }, [selectedDate, startTime, endTime, onChange]);

    return (
        <div className="space-y-6 p-6 rounded-lg shadow-sm border border-gray-100">
            {/* — Date Picker — */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Reservation Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between px-4 py-3 text-left h-12 border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <div className="flex items-center">
                                <CalendarIcon className="mr-3 h-5 w-5 text-gray-500" />
                                <span className="text-gray-900">{format(selectedDate, "PPP")}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0 w-auto shadow-lg rounded-md border border-gray-200">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(d: any) => {
                                setSelectedDate(d);
                                setStartTime(null);
                                setEndTime(null);
                            }}
                            disabled={(d) => d < new Date()}
                            initialFocus
                            className="rounded-md"
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* — Time Selection — */}
            <div className="grid grid-cols-2 gap-4">
                {/* — Start Time — */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <Select
                        onValueChange={(val) => {
                            setStartTime(val);
                            setEndTime(null);
                        }}
                        value={startTime ?? undefined}
                    >
                        <SelectTrigger className="w-full px-4 py-3 text-left h-12 border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                        <SelectContent className="shadow-lg rounded-md border border-gray-200">
                            {allTimes.map((t) => (
                                <SelectItem key={t} value={t} disabled={reservedSlots.has(t)} className="px-4 py-2 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 text-gray-500 mr-3" />
                                            <span className={reservedSlots.has(t) ? "text-gray-400" : "text-gray-900"}>{t}</span>
                                        </div>
                                        {reservedSlots.has(t) && (
                                            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Booked</span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* — End Time — */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <Select
                        onValueChange={(val) => setEndTime(val)}
                        value={endTime ?? undefined}
                    >
                        <SelectTrigger className="w-full px-4 py-3 text-left h-12 border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                        <SelectContent className="shadow-lg rounded-md border border-gray-200">
                            {allTimes.map((t) => {
                                const tooEarly = !startTime || t <= startTime;
                                const conflictsRange = startTime && hasReservedBetween(startTime, t, reservedSlots);
                                const disabled = tooEarly || conflictsRange;
                                return (
                                    <SelectItem
                                        key={t}
                                        value={t}
                                        disabled={disabled}
                                        className="px-4 py-2 hover:bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 text-gray-500 mr-3" />
                                                <span className={disabled ? "text-gray-400" : "text-gray-900"}>{t}</span>
                                            </div>
                                            {conflictsRange && (
                                                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Overlaps</span>
                                            )}
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

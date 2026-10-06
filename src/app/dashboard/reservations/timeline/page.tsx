'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Users,
  CheckCircle2,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Loader } from '@/components/Loader';

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

export default function TableTimelinePage() {
  const { showToast } = useToast();

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/reservations/timeline?date=${selectedDate}`;
      if (selectedSection !== 'ALL') url += `&section=${encodeURIComponent(selectedSection)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTimelineData(data.timeline || []);
      }
    } catch {
      showToast('Failed to load table timeline chart.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedSection, showToast]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const isTimeInBooking = (timeSlot: string, booking: any) => {
    const slotHour = parseInt(timeSlot.split(':')[0], 10);
    const startHour = parseInt(booking.startTime.split(':')[0], 10);
    const endHour = parseInt(booking.endTime.split(':')[0], 10);
    return slotHour >= startHour && slotHour < endHour;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/reservations"
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              <CalendarDays className="w-3.5 h-3.5" /> Table Reservations
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-xs text-slate-500">Visual Grid Timeline</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Visual Table Booking Chart
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time hourly reservation slots across all dining floor tables.
          </p>
        </div>

        {/* Date Selector buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(today)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              selectedDate === today
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => {
              const tmrw = new Date();
              tmrw.setDate(tmrw.getDate() + 1);
              setSelectedDate(tmrw.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          >
            Tomorrow
          </button>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none px-1"
            />
            <button
              onClick={() => changeDateByDays(1)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Section Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <span className="text-slate-400">Timeline Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300">Available Slot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-700 dark:text-slate-300">Reserved / Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-slate-700 dark:text-slate-300">Seated / Occupied</span>
          </div>
        </div>

        <div>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Sections</option>
            <option value="Indoor">Indoor</option>
            <option value="Outdoor">Outdoor</option>
            <option value="Rooftop">Rooftop</option>
            <option value="VIP">VIP Lounge</option>
            <option value="Terrace">Terrace</option>
          </select>
        </div>
      </div>

      {/* Visual Timeline Grid Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            Hourly Slot Occupancy: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {timelineData.length} Tables Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Time Header Row */}
            <div className="grid grid-cols-14 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
              <div className="col-span-2 p-3 border-r border-slate-200 dark:border-slate-700">
                Dining Table
              </div>
              {TIME_SLOTS.map((slot) => (
                <div
                  key={slot}
                  className="col-span-1 p-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0"
                >
                  {slot}
                </div>
              ))}
            </div>

            {/* Table Rows */}
            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <Loader size="lg" text="Loading Timeline" subtitle="Generating interactive slot occupancy matrix..." />
              </div>
            ) : timelineData.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No tables configured on floor.</div>
            ) : (
              timelineData.map((row) => (
                <div
                  key={row.table._id}
                  className="grid grid-cols-14 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors"
                >
                  {/* Table Info Column */}
                  <div className="col-span-2 p-3.5 border-r border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-sm">
                        {row.table.tableNumber}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {row.table.section} • {row.table.capacity}p
                      </p>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        row.table.status === 'AVAILABLE'
                          ? 'bg-emerald-500'
                          : row.table.status === 'OCCUPIED'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                  </div>

                  {/* 12 Hourly Slot Columns */}
                  {TIME_SLOTS.map((slot) => {
                    const matchingBooking = row.bookings.find((b: any) =>
                      isTimeInBooking(slot, b)
                    );

                    if (matchingBooking) {
                      return (
                        <div
                          key={slot}
                          className="col-span-1 p-1 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center"
                        >
                          <div
                            title={`Booked by ${matchingBooking.customerName} (${matchingBooking.startTime} - ${matchingBooking.endTime})`}
                            className={`w-full h-9 rounded-xl flex flex-col items-center justify-center p-1 text-[10px] font-bold transition-all shadow-sm ${
                              matchingBooking.status === 'SEATED'
                                ? 'bg-rose-500 text-white'
                                : 'bg-amber-500 text-slate-950 font-black'
                            }`}
                          >
                            <span className="truncate max-w-full">
                              {matchingBooking.customerName?.split(' ')[0]}
                            </span>
                            <span className="text-[9px] opacity-80">
                              {matchingBooking.numberOfGuests}p
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={slot}
                        className="col-span-1 p-1 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center"
                      >
                        <div className="w-full h-9 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/10 flex items-center justify-center text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold opacity-60 hover:opacity-100 transition-opacity">
                          Open
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

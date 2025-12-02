"use client";

import { Absence } from "../types";
import { useEffect, useRef, useState } from "react";

// --- TIMEZONE FIX HELPER ---
// This ensures the date displayed matches the calendar date stored in the DB,
// ignoring the browser's local timezone shift (e.g., preventing "Nov 24 @ 7PM" for a "Nov 25" entry).
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000; // Convert minutes to ms
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

  return adjustedDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export default function AbsenceTable({ data }: { data: Absence[] }) {
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (tbodyRef.current && wrapperRef.current) {
        const hasOverflow =
          tbodyRef.current.scrollHeight > wrapperRef.current.clientHeight;
        setIsOverflowing(hasOverflow);
      }
    };

    const timer = setTimeout(checkOverflow, 100);

    window.addEventListener("resize", checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [data]);
  // 1. Empty State Handling
  if (data.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-b-lg h-full flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 text-slate-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 mb-1.5 sm:mb-2 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="italic text-xs sm:text-sm md:text-base lg:text-lg">
          No absences reported.
        </p>
      </div>
    );
  }

  // 2. Main Table
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-b-lg overflow-hidden shadow-lg h-full flex flex-col">
      <div
        ref={wrapperRef}
        className="overflow-x-auto relative flex-1 overflow-hidden"
      >
        <table className="w-full text-left text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-300">
          <thead className="bg-slate-950 text-slate-500 uppercase text-[8px] sm:text-[10px] md:text-xs sticky top-0 z-10">
            <tr>
              <th className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
                Date
              </th>
              <th className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
                Badge #
              </th>
              <th className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
                Location
              </th>
              <th className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 hidden md:table-cell">
                Covering Badge
              </th>
              <th className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 hidden lg:table-cell">
                Notes
              </th>
            </tr>
          </thead>
          <tbody
            ref={tbodyRef}
            className={`divide-y divide-slate-800 ${
              isOverflowing ? "animate-table-scroll" : ""
            }`}
          >
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-800/50 transition-colors"
              >
                {/* Apply the Date Fix here */}
                <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 text-slate-400 font-medium whitespace-nowrap text-[8px] sm:text-[10px] md:text-xs lg:text-sm">
                  {formatDate(item.absence_date)}
                </td>

                <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 font-mono text-yellow-400 font-bold text-xs sm:text-sm md:text-base lg:text-lg">
                  {item.badge_number}
                </td>

                <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
                  {item.location_name}
                </td>

                <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 font-mono text-white hidden md:table-cell">
                  {item.covering_badge_number || (
                    <span className="text-slate-600">-</span>
                  )}
                </td>

                <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 italic text-slate-500 hidden lg:table-cell">
                  {item.notes}
                </td>
              </tr>
            ))}
            {isOverflowing &&
              data.map((item) => (
                <tr
                  key={`duplicate-${item.id}`}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 text-slate-400 font-medium whitespace-nowrap text-[8px] sm:text-[10px] md:text-xs lg:text-sm">
                    {formatDate(item.absence_date)}
                  </td>

                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 font-mono text-yellow-400 font-bold text-xs sm:text-sm md:text-base lg:text-lg">
                    {item.badge_number}
                  </td>

                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
                    {item.location_name}
                  </td>

                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 font-mono text-white hidden md:table-cell">
                    {item.covering_badge_number || (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 italic text-slate-500 hidden lg:table-cell">
                    {item.notes}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <style jsx>{`
          @keyframes table-scroll {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(-50%);
            }
          }
          .animate-table-scroll {
            animation: table-scroll 30s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}

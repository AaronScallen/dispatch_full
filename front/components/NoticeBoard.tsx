"use client";

import { Notice } from "../types";
import { useEffect, useRef, useState } from "react";

// --- TIMEZONE FIX HELPER ---
// This ensures the date displayed matches the calendar date stored in the DB,
// ignoring the browser's local timezone shift.
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString();
};

function NoticeText({ text }: { text: string }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const isTextOverflowing =
          textRef.current.scrollHeight > textRef.current.clientHeight;
        setIsOverflowing(isTextOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text]);

  return (
    <div className="relative overflow-hidden">
      <p
        ref={textRef}
        className={`text-[10px] sm:text-xs md:text-sm text-slate-300 ${
          isOverflowing ? "animate-subtle-scroll" : ""
        }`}
        style={{
          maxHeight: "4.5em",
          lineHeight: "1.5em",
        }}
      >
        {text}
      </p>
      <style jsx>{`
        @keyframes subtle-scroll {
          0%,
          20% {
            transform: translateY(0);
          }
          45%,
          65% {
            transform: translateY(calc(-100% + 4.5em));
          }
          90%,
          100% {
            transform: translateY(0);
          }
        }
        .animate-subtle-scroll {
          animation: subtle-scroll 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default function NoticeBoard({ data }: { data: Notice[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 sm:p-3 md:p-4 shadow-lg">
      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-purple-400 uppercase tracking-wide mb-2 sm:mb-3 md:mb-4">
        Notices
      </h2>
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {data.map((notice) => (
          <div
            key={notice.id}
            className="bg-slate-800 p-2 sm:p-2.5 md:p-3 rounded border-l-2 sm:border-l-4 border-purple-500"
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-white font-bold text-xs sm:text-sm md:text-base">
                {notice.title}
              </h3>
              <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap ml-2">
                {formatDate(notice.notice_date)}
              </span>
            </div>
            <NoticeText text={notice.text_content} />
          </div>
        ))}
      </div>
    </div>
  );
}

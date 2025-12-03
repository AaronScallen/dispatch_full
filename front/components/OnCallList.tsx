"use client";

import { OnCall } from "../types";
import { useEffect, useRef, useState } from "react";

export default function OnCallList({ data }: { data: OnCall[] }) {
  const ulRef = useRef<HTMLUListElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (ulRef.current && wrapperRef.current) {
        const hasOverflow =
          ulRef.current.scrollHeight > wrapperRef.current.clientHeight;
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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 sm:p-3 md:p-4 lg:p-5 shadow-lg flex flex-col h-full">
      <h2 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-green-400 uppercase tracking-wide mb-1.5 sm:mb-2 md:mb-3 lg:mb-4">
        On Call Staff
      </h2>
      <div ref={wrapperRef} className="overflow-hidden relative flex-1">
        <ul
          ref={ulRef}
          className={`space-y-1.5 sm:space-y-2 md:space-y-2.5 lg:space-y-3 ${
            isOverflowing ? "animate-list-scroll" : ""
          }`}
        >
          {data.map((person) => (
            <li
              key={person.id}
              className="flex justify-between items-center border-b border-slate-800 pb-1 sm:pb-1.5 md:pb-2 last:border-0"
            >
              <div>
                <p className="text-white font-semibold text-[10px] sm:text-xs md:text-sm lg:text-md">
                  {person.person_name}
                </p>
                <p className="text-[8px] sm:text-[10px] md:text-xs text-slate-500 uppercase">
                  {person.department_name}
                </p>
              </div>
              <span className="font-mono text-yellow-400 text-xs sm:text-sm md:text-md lg:text-md">
                {person.phone_number}
              </span>
            </li>
          ))}
          {isOverflowing &&
            data.map((person) => (
              <li
                key={`duplicate-${person.id}`}
                className="flex justify-between items-center border-b border-slate-800 pb-1 sm:pb-1.5 md:pb-2 last:border-0"
              >
                <div>
                  <p className="text-white font-semibold text-[10px] sm:text-xs md:text-sm lg:text-md">
                    {person.person_name}
                  </p>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-slate-500 uppercase">
                    {person.department_name}
                  </p>
                </div>
                <span className="font-mono text-yellow-400 text-xs sm:text-sm md:text-md lg:text-md">
                  {person.phone_number}
                </span>
              </li>
            ))}
        </ul>
        <style jsx>{`
          @keyframes list-scroll {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(-50%);
            }
          }
          .animate-list-scroll {
            animation: list-scroll 30s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}

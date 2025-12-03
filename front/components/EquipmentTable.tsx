"use client";

import { Equipment } from "../types";
import { useEffect, useRef, useState } from "react";

export default function EquipmentTable({ data }: { data: Equipment[] }) {
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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg h-full flex flex-col">
      <div className="bg-slate-800 px-2 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 lg:py-3 border-b border-slate-700 shrink-0">
        <h2 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-orange-400 uppercase tracking-wide">
          Downed Equipment
        </h2>
      </div>
      <div
        ref={wrapperRef}
        className="overflow-x-auto relative flex-1 overflow-hidden"
      >
        <table className="w-full text-left text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-300">
          <thead className="bg-slate-950 text-slate-500 uppercase text-[8px] sm:text-[10px] md:text-xs sticky top-0 z-10">
            <tr>
              <th className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
                Type
              </th>
              <th className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
                ID
              </th>
              <th className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
                Location
              </th>
              <th className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
                Status
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
              <tr key={item.id} className="hover:bg-slate-800/50">
                <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 text-slate-300">
                  {item.equipment_type}
                </td>
                <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 font-mono text-slate-400 text-[8px] sm:text-[10px] md:text-xs lg:text-sm">
                  {item.equipment_id_number}
                </td>
                <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 font-medium text-white">
                  {item.title}
                </td>
                <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5">
                  <span
                    className={`px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-0.5 md:py-1 rounded text-[8px] sm:text-[10px] md:text-xs font-bold uppercase
                    ${
                      item.status === "Down"
                        ? "bg-red-900 text-red-200"
                        : item.status === "Pending"
                        ? "bg-yellow-500 text-yellow-950"
                        : item.status === "Repairing"
                        ? "bg-yellow-900 text-yellow-200"
                        : "bg-green-900 text-green-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-slate-500 hidden lg:table-cell">
                  {item.notes}
                </td>
              </tr>
            ))}
            {isOverflowing &&
              data.map((item) => (
                <tr
                  key={`duplicate-${item.id}`}
                  className="hover:bg-slate-800/50"
                >
                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 text-slate-300">
                    {item.equipment_type}
                  </td>
                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 font-mono text-slate-400 text-[8px] sm:text-[10px] md:text-xs lg:text-sm">
                    {item.equipment_id_number}
                  </td>
                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 font-medium text-white">
                    {item.title}
                  </td>
                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5">
                    <span
                      className={`px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-0.5 md:py-1 rounded text-[8px] sm:text-[10px] md:text-xs font-bold uppercase
                      ${
                        item.status === "Down"
                          ? "bg-red-900 text-red-200"
                          : item.status === "Pending"
                          ? "bg-yellow-500 text-yellow-950"
                          : item.status === "Repairing"
                          ? "bg-yellow-900 text-yellow-200"
                          : "bg-green-900 text-green-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-slate-500 hidden lg:table-cell">
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

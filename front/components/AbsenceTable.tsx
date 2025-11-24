import { Absence } from "../types";

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
  // 1. Empty State Handling
  if (data.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-b-lg h-full flex flex-col items-center justify-center p-8 text-slate-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mb-2 opacity-50"
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
        <p className="italic text-lg">No absences reported.</p>
      </div>
    );
  }

  // 2. Main Table
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-b-lg overflow-hidden shadow-lg h-full flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm md:text-base text-slate-300">
          <thead className="bg-slate-950 text-slate-500 uppercase text-xs sticky top-0">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Badge #</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Covering Badge</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-800/50 transition-colors"
              >
                {/* Apply the Date Fix here */}
                <td className="px-4 py-3 text-slate-400 font-medium whitespace-nowrap">
                  {formatDate(item.absence_date)}
                </td>

                <td className="px-4 py-3 font-mono text-yellow-400 font-bold text-lg">
                  {item.badge_number}
                </td>

                <td className="px-4 py-3">{item.location_name}</td>

                <td className="px-4 py-3 font-mono text-white">
                  {item.covering_badge_number || (
                    <span className="text-slate-600">-</span>
                  )}
                </td>

                <td className="px-4 py-3 italic text-slate-500">
                  {item.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

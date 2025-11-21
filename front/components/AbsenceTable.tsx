import { Absence } from "../types";

// Helper to format date cleanly
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export default function AbsenceTable({ data }: { data: Absence[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg h-full">
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <h2 className="text-xl font-bold text-blue-400 uppercase tracking-wide">
          Officer Absences
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm md:text-base text-slate-300">
          <thead className="bg-slate-950 text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Badge</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Covering</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/50">
                <td className="px-4 py-3 text-white font-medium">
                  {formatDate(item.absence_date)}
                </td>
                <td className="px-4 py-3 font-mono text-yellow-400">
                  {item.badge_number}
                </td>
                <td className="px-4 py-3">{item.location_name}</td>
                <td className="px-4 py-3 font-mono">
                  {item.covering_badge_number}
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

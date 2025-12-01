import { Equipment } from "../types";

export default function EquipmentTable({ data }: { data: Equipment[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg h-full">
      <div className="bg-slate-800 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-b border-slate-700">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-orange-400 uppercase tracking-wide">
          Downed Equipment
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm md:text-base text-slate-300">
          <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] sm:text-xs">
            <tr>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
                Type
              </th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
                ID
              </th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
                Location
              </th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
                Status
              </th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 hidden lg:table-cell">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/50">
                <td className="px-2 sm:px-3 md:px-4 py-2 text-slate-300">
                  {item.equipment_type}
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2 font-mono text-slate-400 text-[10px] sm:text-xs md:text-sm">
                  {item.equipment_id_number}
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2 font-medium text-white">
                  {item.title}
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2">
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold uppercase
                    ${
                      item.status === "Broken"
                        ? "bg-red-900 text-red-200"
                        : item.status === "Repairing"
                        ? "bg-yellow-900 text-yellow-200"
                        : "bg-green-900 text-green-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2 text-[10px] sm:text-xs text-slate-500 hidden lg:table-cell">
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

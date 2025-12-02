import { Equipment } from "../types";

export default function EquipmentTable({ data }: { data: Equipment[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg h-full">
      <div className="bg-slate-800 px-2 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 lg:py-3 border-b border-slate-700">
        <h2 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-orange-400 uppercase tracking-wide">
          Downed Equipment
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-300">
          <thead className="bg-slate-950 text-slate-500 uppercase text-[8px] sm:text-[10px] md:text-xs">
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
          <tbody className="divide-y divide-slate-800">
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
                <td className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-slate-500 hidden lg:table-cell">
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

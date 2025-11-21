import { Equipment } from "../types";

export default function EquipmentTable({ data }: { data: Equipment[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg h-full">
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <h2 className="text-xl font-bold text-orange-400 uppercase tracking-wide">
          Downed Equipment
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/50">
                <td className="px-4 py-2 font-mono text-slate-400">
                  {item.equipment_id_number}
                </td>
                <td className="px-4 py-2 font-medium text-white">
                  {item.title}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold uppercase
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
                <td className="px-4 py-2 text-xs text-slate-500">
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

import { OnCall } from "../types";

export default function OnCallList({ data }: { data: OnCall[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 sm:p-3 md:p-4 shadow-lg">
      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-green-400 uppercase tracking-wide mb-2 sm:mb-3 md:mb-4">
        On Call Staff
      </h2>
      <ul className="space-y-2 sm:space-y-2.5 md:space-y-3">
        {data.map((person) => (
          <li
            key={person.id}
            className="flex justify-between items-center border-b border-slate-800 pb-1.5 sm:pb-2 last:border-0"
          >
            <div>
              <p className="text-white font-semibold text-xs sm:text-sm md:text-base">
                {person.person_name}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase">
                {person.department_name}
              </p>
            </div>
            <span className="font-mono text-yellow-400 text-sm sm:text-base md:text-lg">
              {person.phone_number}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

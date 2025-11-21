import { OnCall } from "../types";

export default function OnCallList({ data }: { data: OnCall[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold text-green-400 uppercase tracking-wide mb-4">
        On Call Staff
      </h2>
      <ul className="space-y-3">
        {data.map((person) => (
          <li
            key={person.id}
            className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0"
          >
            <div>
              <p className="text-white font-semibold">{person.person_name}</p>
              <p className="text-xs text-slate-500 uppercase">
                {person.department_name}
              </p>
            </div>
            <span className="font-mono text-yellow-400 text-lg">
              {person.phone_number}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

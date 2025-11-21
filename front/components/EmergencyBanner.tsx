import { Alert } from "../types";

export default function EmergencyBanner({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;

  const activeAlert = alerts[0]; // Display the most recent active alert

  return (
    <div className="w-full bg-red-600 animate-pulse border-b-4 border-red-800 shadow-2xl mb-4">
      <div className="max-w-7xl mx-auto py-4 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest">
          {activeAlert.severity_level} ALERT
        </h1>
        <p className="text-2xl md:text-3xl text-white font-bold mt-2">
          {activeAlert.title}
        </p>
      </div>
    </div>
  );
}

import { Alert } from "../types";

export default function EmergencyBanner({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;

  const activeAlert = alerts[0]; // Display the most recent active alert

  return (
    <div className="w-full bg-red-600 animate-pulse border-b-2 sm:border-b-4 border-red-800 shadow-2xl">
      <div className="max-w-7xl mx-auto py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white uppercase tracking-widest">
          {activeAlert.severity_level} ALERT
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white font-bold mt-1 sm:mt-1.5 md:mt-2">
          {activeAlert.title}
        </p>
      </div>
    </div>
  );
}

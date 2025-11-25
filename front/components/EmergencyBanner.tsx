"use client";

import { Alert } from "../types";
import { useState, useEffect, useRef } from "react";

export default function EmergencyBanner({ alerts }: { alerts: Alert[] }) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(0);

  const activeAlert = alerts[0]; // Display the most recent active alert
  const hasAlert = alerts.length > 0;
  const showTimer =
    hasAlert &&
    (activeAlert.severity_level.toLowerCase() === "high" ||
      activeAlert.severity_level.toLowerCase() === "critical");

  // Timer effect - runs when alert is high or critical
  useEffect(() => {
    if (!showTimer) {
      return;
    }

    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimer, activeAlert?.id]);

  // Format elapsed time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!hasAlert) return null;

  // Determine colors based on severity level
  const getSeverityColors = (severity: string) => {
    const normalizedSeverity = severity.toLowerCase();

    switch (normalizedSeverity) {
      case "low":
        return {
          bg: "bg-yellow-400",
          border: "border-yellow-600",
          text: "text-black",
        };
      case "medium":
        return {
          bg: "bg-orange-500",
          border: "border-orange-700",
          text: "text-black",
        };
      case "high":
        return {
          bg: "bg-red-600",
          border: "border-red-800",
          text: "text-white",
        };
      case "critical":
        return {
          bg: "bg-rose-600",
          border: "border-rose-600",
          text: "text-white",
        };
      default:
        return {
          bg: "bg-red-600",
          border: "border-red-800",
          text: "text-white",
        };
    }
  };

  const colors = getSeverityColors(activeAlert.severity_level);

  return (
    <div
      className={`w-full ${colors.bg} animate-pulse border-b-2 sm:border-b-4 ${colors.border} shadow-2xl`}
    >
      <div className="max-w-7xl mx-auto py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-center">
        <h1
          className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black ${colors.text} uppercase tracking-widest`}
        >
          {activeAlert.severity_level} ALERT
        </h1>
        <p
          className={`text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl ${colors.text} font-bold mt-1 sm:mt-1.5 md:mt-2`}
        >
          {activeAlert.title}
        </p>
        {showTimer && (
          <div
            className={`text-sm sm:text-base md:text-lg lg:text-2xl xl:text-4xl ${colors.text} font-mono font-bold mt-1 sm:mt-1.5 md:mt-2`}
          >
            ⏱️ Time Elapsed: {formatTime(elapsedTime)}
          </div>
        )}
      </div>
    </div>
  );
}

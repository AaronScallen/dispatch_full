// client/src/components/ConnectionStatus.tsx
import React from "react";

export default function ConnectionStatus({
  isConnected,
}: {
  isConnected: boolean;
}) {
  if (isConnected) return null; // Don't show anything if online

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-red-600 text-white p-8 rounded-lg shadow-2xl border-4 border-red-400 text-center max-w-2xl animate-pulse">
        <h1 className="text-6xl font-black uppercase tracking-widest mb-4">
          OFFLINE
        </h1>
        <p className="text-2xl font-bold">CONNECTION TO SERVER LOST</p>
        <p className="text-lg mt-4 text-red-100">Attempting to reconnect...</p>

        {/* Optional: Add a spinner or loader icon here */}
        <div className="mt-6 flex justify-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}

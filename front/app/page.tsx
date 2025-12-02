"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import io from "socket.io-client";
import axios from "axios";
import { Absence, Equipment, OnCall, Notice, Alert } from "../types";
import Link from "next/link";

// Components
import EmergencyBanner from "../components/EmergencyBanner";
import AbsenceTable from "../components/AbsenceTable";
import EquipmentTable from "../components/EquipmentTable";
import OnCallList from "../components/OnCallList";
import NoticeBoard from "../components/NoticeBoard";
import ConnectionStatus from "../components/ConnectionStatus";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const socket = io(BACKEND_URL);

// --- HELPER TO CHECK DATES ---
const isSameDay = (dateString: string) => {
  if (!dateString) return false;
  const dbDate = new Date(dateString);

  const userTimezoneOffset = dbDate.getTimezoneOffset() * 60000;
  const adjustedDbDate = new Date(dbDate.getTime() + userTimezoneOffset);

  const today = new Date();

  return (
    adjustedDbDate.getFullYear() === today.getFullYear() &&
    adjustedDbDate.getMonth() === today.getMonth() &&
    adjustedDbDate.getDate() === today.getDate()
  );
};

export default function Dashboard() {
  const router = useRouter();
  const user = useUser();
  const [isConnected, setIsConnected] = useState(true);

  const [absences, setAbsences] = useState<Absence[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [onCall, setOnCall] = useState<OnCall[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Redirect authenticated users to admin page
  useEffect(() => {
    if (user) {
      router.push("/admin");
    }
  }, [user, router]);

  useEffect(() => {
    // 1. Handle Connection States
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // 2. Fetch Initial Data
    const fetchData = async () => {
      try {
        const [absRes, eqRes, callRes, notRes, alertRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/absences`),
          axios.get(`${BACKEND_URL}/api/equipment`),
          axios.get(`${BACKEND_URL}/api/oncall`),
          axios.get(`${BACKEND_URL}/api/notices`),
          axios.get(`${BACKEND_URL}/api/alerts`),
        ]);

        setAbsences(absRes.data);
        setEquipment(eqRes.data);
        setOnCall(callRes.data);
        setNotices(notRes.data);
        setAlerts(alertRes.data);
      } catch (error) {
        console.error("Error fetching data", error);
        setIsConnected(false);
      }
    };
    fetchData();

    // 3. Listen for Data Updates
    socket.on("update_absences", (data) => setAbsences(data));
    socket.on("update_equipment", (data) => setEquipment(data));
    socket.on("update_oncall", (data) => setOnCall(data));
    socket.on("update_notices", (data) => setNotices(data));
    socket.on("update_alerts", (data) => setAlerts(data));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("update_absences");
      socket.off("update_equipment");
      socket.off("update_oncall");
      socket.off("update_notices");
      socket.off("update_alerts");
    };
  }, []);

  // --- FILTER LOGIC ---
  // Only show absences where the date matches Today
  const todaysAbsences = absences.filter((a) => isSameDay(a.absence_date));

  return (
    <main className="h-screen overflow-hidden bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      <ConnectionStatus isConnected={isConnected} />
      <EmergencyBanner alerts={alerts} />

      {/* Header */}
      <div className="text-center py-[clamp(0.5rem,1vh,2rem)]">
        <h1 className="text-[clamp(1.25rem,3vw,4rem)] text-blue-400 uppercase tracking-wider font-mono font-extrabold">
          NISD Police Operations
        </h1>
      </div>

      <div className="flex-1 p-[clamp(0.5rem,1.5vw,2rem)] flex flex-col gap-[clamp(0.75rem,1.5vh,2rem)] overflow-hidden">
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row gap-[clamp(0.75rem,1.5vh,2rem)] flex-3 min-h-0">
          {/* Absences Container */}
          <div className="lg:flex-2 flex flex-col min-h-0 overflow-hidden">
            <div className="bg-slate-800 px-[clamp(0.5rem,1.5vw,1.5rem)] py-[clamp(0.375rem,0.8vh,1rem)] border-b border-slate-700 rounded-t-lg flex justify-between items-center shrink-0">
              <h2 className="text-[clamp(0.875rem,1.5vw,1.5rem)] font-bold text-blue-400 uppercase tracking-wide">
                Officer Absences (Today)
              </h2>
              <span className="bg-slate-900 text-slate-400 text-[clamp(0.625rem,1vw,0.875rem)] px-[clamp(0.375rem,1vw,0.75rem)] py-[clamp(0.25rem,0.5vh,0.5rem)] rounded">
                {todaysAbsences.length} Total
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <AbsenceTable data={todaysAbsences} />
            </div>
          </div>

          {/* On Call Container */}
          <div className="lg:flex-1 overflow-y-auto min-h-0 bg-slate-900 rounded-lg border border-slate-800">
            <OnCallList data={onCall} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col lg:flex-row gap-[clamp(0.75rem,1.5vh,2rem)] flex-2 min-h-0 overflow-hidden">
          <div className="lg:flex-2 min-h-0 overflow-hidden">
            <EquipmentTable data={equipment} />
          </div>
          <div className="lg:flex-1 overflow-y-auto min-h-0 bg-slate-900 rounded-lg border border-slate-800">
            <NoticeBoard data={notices} />
          </div>
        </div>
      </div>

      {/* Admin Link */}
      <div className="absolute bottom-[clamp(0.5rem,1vh,1rem)] right-[clamp(0.5rem,1vh,1rem)] opacity-50 hover:opacity-100 transition-opacity">
        <Link
          href="/admin"
          className="text-[clamp(0.625rem,1vw,0.875rem)] text-slate-500 hover:text-slate-300"
        >
          Admin
        </Link>
      </div>

      {/* Created By Credit */}
      <div className="absolute bottom-[clamp(0.5rem,1vh,1rem)] left-[clamp(0.5rem,1vh,1rem)] opacity-40">
        <p className="text-[clamp(0.625rem,1vw,0.875rem)] text-slate-500">
          Created By Cpl Scallen
        </p>
      </div>
    </main>
  );
}

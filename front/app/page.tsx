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
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white">
      <ConnectionStatus isConnected={isConnected} />
      <EmergencyBanner alerts={alerts} />

      {/* Header */}
      <div className="text-center py-4 lg:py-5">
        <h1 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl text-blue-400 uppercase tracking-wider font-mono font-extrabold">
          NISD Police Operations
        </h1>
      </div>

      <div className="p-4 lg:p-6 flex flex-col gap-6 h-auto lg:h-[calc(100vh-120px)]">
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row gap-6 lg:h-[60%] shrink-0">
          {/* Absences Container */}
          <div className="lg:w-2/3 flex flex-col min-h-[400px] lg:min-h-0">
            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 rounded-t-lg flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-blue-400 uppercase tracking-wide">
                Officer Absences (Today)
              </h2>
              <span className="bg-slate-900 text-slate-400 text-xs px-2 py-1 rounded">
                {todaysAbsences.length} Total
              </span>
            </div>
            <div className="flex-1 overflow-hidden h-full">
              <AbsenceTable data={todaysAbsences} />
            </div>
          </div>

          {/* On Call Container */}
          <div className="lg:w-1/3 overflow-y-auto min-h-[300px] lg:min-h-0 bg-slate-900 rounded-lg border border-slate-800">
            <OnCallList data={onCall} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col lg:flex-row gap-6 lg:h-[40%] pb-10 lg:pb-0 shrink-0">
          <div className="lg:w-2/3 min-h-[400px] lg:min-h-0">
            <EquipmentTable data={equipment} />
          </div>
          <div className="lg:w-1/3 overflow-y-auto min-h-[300px] lg:min-h-0 bg-slate-900 rounded-lg border border-slate-800">
            <NoticeBoard data={notices} />
          </div>
        </div>
      </div>

      {/* Admin Link */}
      <div className="fixed bottom-2 right-2 opacity-50 hover:opacity-100 transition-opacity">
        <Link
          href="/admin"
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          Admin
        </Link>
      </div>

      {/* Created By Credit */}
      <div className="fixed bottom-2 left-2 opacity-40">
        <p className="text-xs text-slate-500">Created By Cpl Scallen</p>
      </div>
    </main>
  );
}

"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import Image from "next/image";
import { Absence, Equipment, OnCall, Notice, Alert } from "../types";

// Components
import EmergencyBanner from "../components/EmergencyBanner";
import AbsenceTable from "../components/AbsenceTable";
import EquipmentTable from "../components/EquipmentTable";
import OnCallList from "../components/OnCallList";
import NoticeBoard from "../components/NoticeBoard";
import ConnectionStatus from "../components/ConnectionStatus"; // <--- NEW IMPORT

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const socket = io(BACKEND_URL);

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(true); // <--- NEW STATE

  const [absences, setAbsences] = useState<Absence[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [onCall, setOnCall] = useState<OnCall[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // 1. Handle Connection States
    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    // 2. Fetch Initial Data
    const fetchData = async () => {
      try {
        const absRes = await axios.get(`${BACKEND_URL}/api/absences`);
        const eqRes = await axios.get(`${BACKEND_URL}/api/equipment`);
        const callRes = await axios.get(`${BACKEND_URL}/api/oncall`);
        const notRes = await axios.get(`${BACKEND_URL}/api/notices`);
        const alertRes = await axios.get(`${BACKEND_URL}/api/alerts`);

        setAbsences(absRes.data);
        setEquipment(eqRes.data);
        setOnCall(callRes.data);
        setNotices(notRes.data);
        setAlerts(alertRes.data);
      } catch (error) {
        console.error("Error fetching data", error);
        // If fetch fails, we assume offline (or at least api is down)
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

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Visual Warning Overlay */}
      <ConnectionStatus isConnected={isConnected} />

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 py-4 px-6">
        <div className="flex items-center gap-4">
          <Image
            src="/icoreshield.PNG"
            alt="NISD Police Logo"
            width={64}
            height={64}
            className="object-contain"
          />
          <h1 className="text-3xl font-bold text-white">
            NISD Police Operations
          </h1>
        </div>
      </header>

      {/* Emergency Alert Banner */}
      <EmergencyBanner alerts={alerts} />

      <div className="p-6 h-screen flex flex-col gap-6">
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row gap-6 h-1/2">
          <div className="lg:w-2/3 h-full">
            <AbsenceTable data={absences} />
          </div>
          <div className="lg:w-1/3 h-full overflow-y-auto">
            <OnCallList data={onCall} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col lg:flex-row gap-6 h-1/2 pb-10">
          <div className="lg:w-2/3 h-full">
            <EquipmentTable data={equipment} />
          </div>
          <div className="lg:w-1/3 h-full overflow-y-auto">
            <NoticeBoard data={notices} />
          </div>
        </div>
      </div>
    </main>
  );
}

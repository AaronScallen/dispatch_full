"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Absence, Equipment, OnCall, Notice, Alert } from "../../types";

// --- CONFIGURATION ---
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
const API = `${BACKEND_URL}/api`;

// Initialize socket connection
const socket = io(BACKEND_URL);

export default function Admin() {
  // --- APP STATE ---
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState("absences");
  const [statusMsg, setStatusMsg] = useState("");

  // --- DATA STORE ---
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [onCall, setOnCall] = useState<OnCall[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // --- EDIT MODE STATE ---
  const [editId, setEditId] = useState<number | null>(null);

  // --- FORM INPUT STATES ---
  // Absences
  const [absBadge, setAbsBadge] = useState("");
  const [absLoc, setAbsLoc] = useState("");
  const [absCover, setAbsCover] = useState("");
  const [absDate, setAbsDate] = useState("");
  const [absNote, setAbsNote] = useState("");

  // Equipment
  const [eqType, setEqType] = useState("");
  const [eqID, setEqID] = useState("");
  const [eqTitle, setEqTitle] = useState("");
  const [eqStatus, setEqStatus] = useState("Broken");
  const [eqNotes, setEqNotes] = useState("");

  // On Call
  const [ocDept, setOcDept] = useState("");
  const [ocName, setOcName] = useState("");
  const [ocPhone, setOcPhone] = useState("");

  // Notices
  const [notDate, setNotDate] = useState("");
  const [notTitle, setNotTitle] = useState("");
  const [notText, setNotText] = useState("");

  // Alerts
  const [alertLevel, setAlertLevel] = useState("High");
  const [alertTitle, setAlertTitle] = useState("");

  // --- INITIALIZATION & SOCKETS ---
  const fetchData = async () => {
    try {
      const [absRes, eqRes, ocRes, notRes, alRes] = await Promise.all([
        axios.get(`${API}/absences`),
        axios.get(`${API}/equipment`),
        axios.get(`${API}/oncall`),
        axios.get(`${API}/notices`),
        axios.get(`${API}/alerts`),
      ]);
      setAbsences(absRes.data);
      setEquipment(eqRes.data);
      setOnCall(ocRes.data);
      setNotices(notRes.data);
      setAlerts(alRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
      // If fetch fails, server is likely down
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Defer the initial fetch to avoid triggering synchronous setState within the effect
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) fetchData();
    }, 0);

    // Socket Listeners for Connection Health
    socket.on("connect", () => {
      console.log("Connected to Admin Socket");
      setIsConnected(true);
      setStatusMsg("Server Online");
      setTimeout(() => setStatusMsg(""), 2000);
    });

    socket.on("disconnect", () => {
      console.log("Lost connection");
      setIsConnected(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  // --- HELPERS ---
  const handleSuccess = (msg: string) => {
    setStatusMsg(msg);
    fetchData(); // Refetch to see changes
    resetForms();
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const resetForms = () => {
    setEditId(null);
    // Reset all fields
    setAbsBadge("");
    setAbsLoc("");
    setAbsCover("");
    setAbsDate("");
    setAbsNote("");
    setEqType("");
    setEqID("");
    setEqTitle("");
    setEqStatus("Broken");
    setEqNotes("");
    setOcDept("");
    setOcName("");
    setOcPhone("");
    setNotDate("");
    setNotTitle("");
    setNotText("");
    setAlertTitle("");
  };

  const deleteItem = async (endpoint: string, id: number) => {
    if (!isConnected) return alert("Cannot delete while offline.");
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`${API}/${endpoint}/${id}`);
      handleSuccess("Item Deleted");
    } catch (err) {
      alert("Error deleting item");
    }
  };

  // --- SUBMIT HANDLERS ---

  // 1. ABSENCES
  const submitAbsence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    const payload = {
      badge_number: absBadge,
      location_name: absLoc,
      covering_badge_number: absCover,
      absence_date: absDate || new Date(),
      notes: absNote,
    };
    try {
      if (editId) await axios.put(`${API}/absences/${editId}`, payload);
      else await axios.post(`${API}/absences`, payload);
      handleSuccess(editId ? "Absence Updated" : "Absence Added");
    } catch (err) {
      alert("Error saving");
    }
  };

  const editAbsence = (item: Absence) => {
    setEditId(item.id);
    setAbsBadge(item.badge_number);
    setAbsLoc(item.location_name);
    setAbsCover(item.covering_badge_number);
    setAbsDate(new Date(item.absence_date).toISOString().split("T")[0]);
    setAbsNote(item.notes);
    window.scrollTo(0, 0);
  };

  // 2. EQUIPMENT
  const submitEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    const payload = {
      equipment_type: eqType,
      equipment_id_number: eqID,
      title: eqTitle,
      status: eqStatus,
      notes: eqNotes,
    };
    try {
      if (editId) await axios.put(`${API}/equipment/${editId}`, payload);
      else await axios.post(`${API}/equipment`, payload);
      handleSuccess(editId ? "Equipment Updated" : "Equipment Reported");
    } catch (err) {
      alert("Error saving");
    }
  };

  const editEquipment = (item: Equipment) => {
    setEditId(item.id);
    setEqType(item.equipment_type);
    setEqID(item.equipment_id_number);
    setEqTitle(item.title);
    setEqStatus(item.status);
    setEqNotes(item.notes);
    window.scrollTo(0, 0);
  };

  // 3. ON CALL
  const submitOnCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    const payload = {
      department_name: ocDept,
      person_name: ocName,
      phone_number: ocPhone,
    };
    try {
      if (editId) await axios.put(`${API}/oncall/${editId}`, payload);
      else await axios.post(`${API}/oncall`, payload);
      handleSuccess(editId ? "Staff Updated" : "Staff Added");
    } catch (err) {
      alert("Error saving");
    }
  };

  const editOnCall = (item: OnCall) => {
    setEditId(item.id);
    setOcDept(item.department_name);
    setOcName(item.person_name);
    setOcPhone(item.phone_number);
    window.scrollTo(0, 0);
  };

  // 4. NOTICES
  const submitNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    const payload = {
      notice_date: notDate || new Date(),
      title: notTitle,
      text_content: notText,
    };
    try {
      if (editId) await axios.put(`${API}/notices/${editId}`, payload);
      else await axios.post(`${API}/notices`, payload);
      handleSuccess(editId ? "Notice Updated" : "Notice Posted");
    } catch (err) {
      alert("Error saving");
    }
  };

  const editNotice = (item: Notice) => {
    setEditId(item.id);
    setNotDate(new Date(item.notice_date).toISOString().split("T")[0]);
    setNotTitle(item.title);
    setNotText(item.text_content);
    window.scrollTo(0, 0);
  };

  // 5. ALERTS
  const submitAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    try {
      await axios.post(`${API}/alerts`, {
        severity_level: alertLevel,
        title: alertTitle,
      });
      handleSuccess("ALERT BROADCASTED");
    } catch (err) {
      alert("Error sending alert");
    }
  };

  const dismissAlert = async (id: number) => {
    if (!isConnected) return;
    try {
      await axios.put(`${API}/alerts/${id}/dismiss`);
      handleSuccess("Alert Dismissed");
    } catch (err) {
      alert("Error dismissing");
    }
  };

  const clearAllAlerts = async () => {
    if (!isConnected) return;
    if (!confirm("Clear ALL active alerts?")) return;
    try {
      await axios.post(`${API}/alerts/clear`);
      handleSuccess("All Alerts Cleared");
    } catch (err) {
      alert("Error clearing alerts");
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">
      {/* OFFLINE WARNING BANNER */}
      {!isConnected && (
        <div className="bg-red-600 text-white text-center p-3 font-bold sticky top-0 z-[100] shadow-lg animate-pulse">
          ⚠️ SYSTEM OFFLINE - DO NOT SUBMIT CHANGES - ATTEMPTING RECONNECT...
        </div>
      )}

      {/* HEADER */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md flex justify-between items-center">
        <h1 className="font-bold text-lg">Dispatch Admin</h1>
        <div className="text-xs uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-1 rounded">
          {activeTab} Manager
        </div>
      </div>

      {/* STATUS TOAST */}
      {statusMsg && isConnected && (
        <div className="fixed top-16 left-0 right-0 flex justify-center z-40 pointer-events-none">
          <div className="bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-xl animate-bounce">
            {statusMsg}
          </div>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="bg-white shadow overflow-x-auto flex sticky top-14 z-40">
        {["absences", "equipment", "oncall", "notices", "alerts"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              resetForms();
            }}
            className={`flex-1 py-4 px-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap
              ${
                activeTab === tab
                  ? "text-blue-600 border-b-4 border-blue-600 bg-blue-50"
                  : "text-gray-400 hover:bg-gray-50"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {/* ================= ABSENCES TAB ================= */}
        {activeTab === "absences" && (
          <>
            <form
              onSubmit={submitAbsence}
              className="bg-white p-4 rounded shadow mb-8 space-y-3 border border-gray-200"
            >
              <h2 className="font-bold text-gray-700 border-b pb-2">
                {editId ? "Edit Absence" : "Log New Absence"}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input-field"
                  placeholder="Badge #"
                  value={absBadge}
                  onChange={(e) => setAbsBadge(e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Location"
                  value={absLoc}
                  onChange={(e) => setAbsLoc(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input-field"
                  placeholder="Covering Badge"
                  value={absCover}
                  onChange={(e) => setAbsCover(e.target.value)}
                />
                <input
                  type="date"
                  className="input-field"
                  value={absDate}
                  onChange={(e) => setAbsDate(e.target.value)}
                  required
                />
              </div>
              <textarea
                className="input-field"
                placeholder="Notes"
                value={absNote}
                onChange={(e) => setAbsNote(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!isConnected}
                  className="btn-primary bg-blue-600 hover:bg-blue-700"
                >
                  {editId ? "Update Record" : "Submit Record"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              {absences.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded shadow flex justify-between items-center border-l-4 border-blue-400"
                >
                  <div>
                    <p className="font-bold text-gray-800">
                      Badge #{item.badge_number}{" "}
                      <span className="text-gray-400 text-sm font-normal">
                        | {item.location_name}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 uppercase">
                      {new Date(item.absence_date).toLocaleDateString()}{" "}
                      {item.covering_badge_number &&
                        `(Cover: ${item.covering_badge_number})`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 italic">
                      {item.notes}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => editAbsence(item)}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => deleteItem("absences", item.id)}
                      className="text-red-600 font-bold text-sm hover:underline"
                    >
                      DEL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= EQUIPMENT TAB ================= */}
        {activeTab === "equipment" && (
          <>
            <form
              onSubmit={submitEquipment}
              className="bg-white p-4 rounded shadow mb-8 space-y-3 border border-gray-200"
            >
              <h2 className="font-bold text-gray-700 border-b pb-2">
                {editId ? "Edit Equipment" : "Report Downed Equipment"}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input-field"
                  placeholder="Type (Radio, Car...)"
                  value={eqType}
                  onChange={(e) => setEqType(e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  placeholder="ID #"
                  value={eqID}
                  onChange={(e) => setEqID(e.target.value)}
                  required
                />
              </div>
              <input
                className="input-field"
                placeholder="Title / Description"
                value={eqTitle}
                onChange={(e) => setEqTitle(e.target.value)}
                required
              />
              <select
                className="input-field"
                value={eqStatus}
                onChange={(e) => setEqStatus(e.target.value)}
              >
                <option value="Broken">Broken</option>
                <option value="Repairing">Repairing</option>
                <option value="Fixed">Fixed</option>
              </select>
              <textarea
                className="input-field"
                placeholder="Notes"
                value={eqNotes}
                onChange={(e) => setEqNotes(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!isConnected}
                  className="btn-primary bg-orange-600 hover:bg-orange-700"
                >
                  {editId ? "Update Status" : "Report Down"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              {equipment.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded shadow border-l-4 border-orange-400 flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded text-white ${
                          item.status === "Broken"
                            ? "bg-red-600"
                            : item.status === "Repairing"
                            ? "bg-yellow-500"
                            : "bg-green-600"
                        }`}
                      >
                        {item.status}
                      </span>
                      <p className="font-bold text-gray-800">{item.title}</p>
                    </div>
                    <p className="text-sm text-gray-500 font-mono">
                      ID: {item.equipment_id_number}
                    </p>
                    <p className="text-sm text-gray-600 italic">{item.notes}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => editEquipment(item)}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => deleteItem("equipment", item.id)}
                      className="text-red-600 font-bold text-sm hover:underline"
                    >
                      DEL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= ON CALL TAB ================= */}
        {activeTab === "oncall" && (
          <>
            <form
              onSubmit={submitOnCall}
              className="bg-white p-4 rounded shadow mb-8 space-y-3 border border-gray-200"
            >
              <h2 className="font-bold text-gray-700 border-b pb-2">
                {editId ? "Edit Staff" : "Add On-Call Staff"}
              </h2>
              <input
                className="input-field"
                placeholder="Department"
                value={ocDept}
                onChange={(e) => setOcDept(e.target.value)}
                required
              />
              <input
                className="input-field"
                placeholder="Name"
                value={ocName}
                onChange={(e) => setOcName(e.target.value)}
                required
              />
              <input
                className="input-field"
                placeholder="Phone Number"
                value={ocPhone}
                onChange={(e) => setOcPhone(e.target.value)}
                required
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!isConnected}
                  className="btn-primary bg-green-600 hover:bg-green-700"
                >
                  {editId ? "Update Staff" : "Add Staff"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              {onCall.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded shadow flex justify-between items-center border-l-4 border-green-500"
                >
                  <div>
                    <p className="font-bold text-gray-800 text-lg">
                      {item.person_name}
                    </p>
                    <p className="text-sm text-gray-500 font-semibold uppercase">
                      {item.department_name}
                    </p>
                    <p className="text-lg font-mono text-gray-700">
                      {item.phone_number}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => editOnCall(item)}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => deleteItem("oncall", item.id)}
                      className="text-red-600 font-bold text-sm hover:underline"
                    >
                      DEL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= NOTICES TAB ================= */}
        {activeTab === "notices" && (
          <>
            <form
              onSubmit={submitNotice}
              className="bg-white p-4 rounded shadow mb-8 space-y-3 border border-gray-200"
            >
              <h2 className="font-bold text-gray-700 border-b pb-2">
                {editId ? "Edit Notice" : "Post New Notice"}
              </h2>
              <input
                type="date"
                className="input-field"
                value={notDate}
                onChange={(e) => setNotDate(e.target.value)}
                required
              />
              <input
                className="input-field"
                placeholder="Title"
                value={notTitle}
                onChange={(e) => setNotTitle(e.target.value)}
                required
              />
              <textarea
                className="input-field"
                placeholder="Content"
                value={notText}
                onChange={(e) => setNotText(e.target.value)}
                rows={3}
                required
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!isConnected}
                  className="btn-primary bg-purple-600 hover:bg-purple-700"
                >
                  {editId ? "Update Notice" : "Post Notice"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              {notices.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded shadow border-l-4 border-purple-400 flex justify-between items-center"
                >
                  <div className="w-3/4">
                    <div className="flex justify-between items-end mb-1">
                      <p className="font-bold text-gray-800 text-lg">
                        {item.title}
                      </p>
                      <span className="text-xs text-gray-400">
                        {new Date(item.notice_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.text_content}
                    </p>
                  </div>
                  <div className="flex gap-3 pl-2">
                    <button
                      onClick={() => editNotice(item)}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => deleteItem("notices", item.id)}
                      className="text-red-600 font-bold text-sm hover:underline"
                    >
                      DEL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= ALERTS TAB ================= */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200 shadow-inner">
              <h2 className="text-red-800 font-black text-xl mb-4 uppercase tracking-wide flex items-center gap-2">
                🚨 Trigger Emergency Alert
              </h2>
              <form onSubmit={submitAlert} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-red-800 uppercase mb-1">
                    Severity
                  </label>
                  <select
                    value={alertLevel}
                    onChange={(e) => setAlertLevel(e.target.value)}
                    className="input-field bg-white border-red-200 text-red-900 font-bold"
                  >
                    <option value="Low">Low Severity (Yellow)</option>
                    <option value="Medium">Medium Severity (Orange)</option>
                    <option value="High">High Severity (Red)</option>
                    <option value="Critical">CRITICAL (Flashing)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-red-800 uppercase mb-1">
                    Alert Text
                  </label>
                  <input
                    placeholder="e.g. OFFICER DOWN - DOWNTOWN SECTOR"
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    className="input-field border-red-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isConnected}
                  className="w-full py-4 bg-red-600 text-white font-black text-lg rounded shadow-lg hover:bg-red-700 active:scale-95 transition"
                >
                  BROADCAST ALERT
                </button>
              </form>
            </div>

            <button
              onClick={clearAllAlerts}
              disabled={!isConnected}
              className="w-full py-3 bg-gray-600 text-white font-bold rounded hover:bg-gray-700 border border-gray-500"
            >
              CLEAR ALL ACTIVE ALERTS
            </button>

            {/* Active Alerts List */}
            <div className="space-y-2 mt-6">
              <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wide">
                Currently Active Alerts
              </h3>
              {alerts.length === 0 ? (
                <p className="text-gray-400 text-sm italic bg-white p-4 rounded border border-dashed">
                  No active alerts.
                </p>
              ) : (
                alerts.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded shadow border-l-8 border-red-600 flex justify-between items-center animate-pulse"
                  >
                    <div>
                      <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-1 rounded uppercase">
                        {item.severity_level}
                      </span>
                      <p className="font-bold text-red-600 text-lg mt-1">
                        {item.title}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissAlert(item.id)}
                      className="text-gray-500 text-xs border border-gray-300 px-3 py-2 rounded hover:bg-gray-100 hover:text-red-600 font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

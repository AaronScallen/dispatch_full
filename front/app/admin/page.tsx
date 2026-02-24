"use client";
import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import axios from "axios";
import io from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { Absence, Equipment, OnCall, Notice, Alert } from "../../types";

// --- CONFIGURATION ---
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const API = `${BACKEND_URL}/api`;

// Initialize socket connection
const socket = io(BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

// --- TIMEZONE FIX HELPER ---
// This ensures the date displayed matches the calendar date stored in the DB,
// ignoring the browser's local timezone shift.
const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString();
};

export default function Admin() {
  // --- AUTH STATE ---
  const user = useUser();

  // --- APP STATE ---
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState("absences");
  const [statusMsg, setStatusMsg] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- MODAL STATE ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ title: "", message: "", onConfirm: () => {} });

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
  const [eqStatus, setEqStatus] = useState("Down");
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

  // --- TRACK ADMIN LOGIN ---
  useEffect(() => {
    const logAdminLogin = async () => {
      if (user) {
        try {
          await axios.post(`${API}/admin-login`, {
            user_id: user.id,
            user_email: user.primaryEmail || "unknown",
            ip_address: null, // IP will be captured server-side if needed
            user_agent: navigator.userAgent,
            session_info: {
              display_name: user.displayName,
              primary_email_verified: user.primaryEmailVerified,
            },
          });
          console.log("Admin login tracked successfully");
        } catch (err) {
          console.error("Failed to track admin login:", err);
          // Don't block the app if tracking fails
        }
      }
    };

    logAdminLogin();
  }, [user]);

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
    setEqStatus("Down");
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
    if (!isConnected) return toast.error("Cannot delete while offline.");
    setConfirmModalConfig({
      title: "Confirm Delete",
      message:
        "Are you sure you want to delete this item? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/${endpoint}/${id}`);
          handleSuccess("Item Deleted");
        } catch {
          toast.error("Error deleting item");
        }
        setShowConfirmModal(false);
      },
    });
    setShowConfirmModal(true);
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
      created_by_email: user?.primaryEmail || "unknown",
      created_by_name:
        user?.displayName || user?.primaryEmail || "Unknown User",
      updated_by_email: user?.primaryEmail || "unknown",
      updated_by_name:
        user?.displayName || user?.primaryEmail || "Unknown User",
    };
    try {
      if (editId) await axios.put(`${API}/absences/${editId}`, payload);
      else await axios.post(`${API}/absences`, payload);
      handleSuccess(editId ? "Absence Updated" : "Absence Added");
    } catch {
      toast.error("Error saving absence");
    }
  };

  const editAbsence = (item: Absence) => {
    setEditId(item.id);
    setAbsBadge(item.badge_number);
    setAbsLoc(item.location_name);
    setAbsCover(item.covering_badge_number);
    const rawDate =
      typeof item.absence_date === "string"
        ? item.absence_date
        : new Date(item.absence_date).toISOString();
    setAbsDate(rawDate.substring(0, 10));
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
      created_by_email: user?.primaryEmail || "unknown",
      created_by_name:
        user?.displayName || user?.primaryEmail || "Unknown User",
      updated_by_email: user?.primaryEmail || "unknown",
      updated_by_name:
        user?.displayName || user?.primaryEmail || "Unknown User",
    };
    try {
      if (editId) await axios.put(`${API}/equipment/${editId}`, payload);
      else await axios.post(`${API}/equipment`, payload);
      handleSuccess(editId ? "Equipment Updated" : "Equipment Reported");
    } catch {
      toast.error("Error saving equipment");
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
      created_by_email: user?.primaryEmail || "unknown",
      created_by_name:
        user?.displayName || user?.primaryEmail || "Unknown User",
      updated_by_email: user?.primaryEmail || "unknown",
      updated_by_name:
        user?.displayName || user?.primaryEmail || "Unknown User",
    };
    try {
      if (editId) await axios.put(`${API}/oncall/${editId}`, payload);
      else await axios.post(`${API}/oncall`, payload);
      handleSuccess(editId ? "Staff Updated" : "Staff Added");
    } catch {
      toast.error("Error saving on-call staff");
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
      created_by_email: user?.primaryEmail || "unknown",
      created_by_name:
        user?.displayName || user?.primaryEmail || "Unknown User",
      updated_by_email: user?.primaryEmail || "unknown",
      updated_by_name:
        user?.displayName || user?.primaryEmail || "Unknown User",
    };
    try {
      if (editId) await axios.put(`${API}/notices/${editId}`, payload);
      else await axios.post(`${API}/notices`, payload);
      handleSuccess(editId ? "Notice Updated" : "Notice Posted");
    } catch {
      toast.error("Error saving notice");
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
        created_by_email: user?.primaryEmail || "unknown",
        created_by_name:
          user?.displayName || user?.primaryEmail || "Unknown User",
      });
      handleSuccess("ALERT BROADCASTED");
    } catch {
      toast.error("Error sending alert");
    }
  };

  const dismissAlert = async (id: number) => {
    if (!isConnected) return;
    try {
      await axios.put(`${API}/alerts/${id}/dismiss`, {
        updated_by_email: user?.primaryEmail || "unknown",
        updated_by_name:
          user?.displayName || user?.primaryEmail || "Unknown User",
      });
      handleSuccess("Alert Dismissed");
    } catch {
      toast.error("Error dismissing alert");
    }
  };

  const clearAllAlerts = async () => {
    if (!isConnected) return;
    setConfirmModalConfig({
      title: "Clear All Alerts",
      message:
        "Are you sure you want to clear ALL active alerts? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await axios.post(`${API}/alerts/clear`);
          handleSuccess("All Alerts Cleared");
        } catch {
          toast.error("Error clearing alerts");
        }
        setShowConfirmModal(false);
      },
    });
    setShowConfirmModal(true);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans overflow-y-auto relative">
      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-5 md:p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              {confirmModalConfig.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-5 md:mb-6">
              {confirmModalConfig.message}
            </p>
            <div className="flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={confirmModalConfig.onConfirm}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors text-sm sm:text-base"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
            fontWeight: "bold",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      {/* OFFLINE WARNING BANNER */}
      {!isConnected && (
        <div className="bg-red-600 text-white text-center p-2 sm:p-3 font-bold fixed top-0 left-0 right-0 z-50 shadow-lg animate-pulse text-xs sm:text-sm md:text-base">
          ⚠️ SYSTEM OFFLINE - DO NOT SUBMIT CHANGES - ATTEMPTING RECONNECT...
        </div>
      )}

      {/* HEADER */}
      <div
        className={`bg-slate-900 text-white p-2 sm:p-3 md:p-4 sticky z-40 shadow-md flex justify-between items-center ${
          !isConnected ? "top-12" : "top-0"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger Button - Mobile Only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 w-6 h-6 justify-center"
            aria-label="Toggle menu"
          >
            <span
              className={`block h-0.5 w-6 bg-white transition-transform ${
                isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`block h-0.5 w-6 bg-white transition-opacity ${
                isMobileMenuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`block h-0.5 w-6 bg-white transition-transform ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </button>
          <h1 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl">
            Admin Entry
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 bg-slate-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hidden sm:block">
            {activeTab} Manager
          </div>
          {user && (
            <button
              onClick={() => user.signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-semibold transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* STATUS TOAST */}
      {statusMsg && isConnected && (
        <div className="fixed top-16 left-0 right-0 flex justify-center z-40 pointer-events-none">
          <div className="bg-green-600 text-white px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-full font-bold shadow-xl animate-bounce text-xs sm:text-sm md:text-base">
            {statusMsg}
          </div>
        </div>
      )}

      {/* NAVIGATION - Mobile Menu (Dropdown) */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 top-14 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {["absences", "equipment", "oncall", "notices", "alerts"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    resetForms();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-bold uppercase tracking-wider border-b border-gray-100
                  ${
                    activeTab === tab
                      ? "text-blue-600 bg-blue-50 border-l-4 border-l-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* NAVIGATION TABS - Desktop Only */}
      <div
        className={`bg-white shadow overflow-x-auto hidden md:flex sticky z-30 ${
          !isConnected ? "top-26" : "top-14"
        }`}
      >
        {["absences", "equipment", "oncall", "notices", "alerts"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              resetForms();
            }}
            className={`flex-1 py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm lg:text-base font-bold uppercase tracking-wider whitespace-nowrap
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

      <div className="max-w-3xl mx-auto p-3 md:p-4">
        {/* ================= ABSENCES TAB ================= */}
        {activeTab === "absences" && (
          <>
            <form
              onSubmit={submitAbsence}
              className="bg-white p-3 md:p-4 rounded shadow mb-6 md:mb-8 space-y-3 border border-gray-200"
            >
              <h2 className="font-bold text-gray-700 border-b pb-2 text-sm md:text-base">
                {editId ? "Edit Absence" : "Log New Absence"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!isConnected}
                  className="btn-primary bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  {editId ? "Update Record" : "Submit Record"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full sm:w-auto"
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
                  className="bg-white p-3 md:p-4 rounded shadow flex flex-col sm:flex-row sm:justify-between sm:items-center border-l-4 border-blue-400 gap-3"
                >
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-sm md:text-base">
                      Badge #{item.badge_number}{" "}
                      <span className="text-gray-400 text-xs md:text-sm font-normal block sm:inline">
                        | {item.location_name}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 uppercase">
                      {formatDate(item.absence_date)}{" "}
                      {item.covering_badge_number &&
                        `(Cover: ${item.covering_badge_number})`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 italic">
                      {item.notes}
                    </p>
                  </div>
                  <div className="flex gap-3 sm:flex-col lg:flex-row">
                    <button
                      onClick={() => editAbsence(item)}
                      className="text-blue-600 font-bold text-sm hover:underline flex-1 sm:flex-none"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => deleteItem("absences", item.id)}
                      className="text-red-600 font-bold text-sm hover:underline flex-1 sm:flex-none"
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
              className="bg-white p-3 md:p-4 rounded shadow mb-6 md:mb-8 space-y-3 border border-gray-200"
            >
              <h2 className="font-bold text-gray-700 border-b pb-2 text-sm md:text-base">
                {editId ? "Edit Equipment" : "Report Downed Equipment"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <option value="Down">Down</option>
                <option value="Pending">Pending</option>
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
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!isConnected}
                  className="btn-primary bg-orange-600 hover:bg-orange-700 flex-1"
                >
                  {editId ? "Update Status" : "Report Down"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full sm:w-auto"
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
                  className="bg-white p-3 md:p-4 rounded shadow border-l-4 border-orange-400 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded w-fit ${
                          item.status === "Down"
                            ? "bg-red-600 text-white"
                            : item.status === "Pending"
                              ? "bg-yellow-500 text-yellow-950"
                              : item.status === "Repairing"
                                ? "bg-yellow-500 text-white"
                                : "bg-green-600 text-white"
                        }`}
                      >
                        {item.status}
                      </span>
                      <p className="font-bold text-gray-800 text-sm md:text-base">
                        {item.title}
                      </p>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 font-mono">
                      ID: {item.equipment_id_number}
                    </p>
                    <p className="text-sm text-gray-600 italic">{item.notes}</p>
                  </div>
                  <div className="flex gap-3 sm:flex-col lg:flex-row">
                    <button
                      onClick={() => editEquipment(item)}
                      className="text-blue-600 font-bold text-sm hover:underline flex-1 sm:flex-none"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => deleteItem("equipment", item.id)}
                      className="text-red-600 font-bold text-sm hover:underline flex-1 sm:flex-none"
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
              className="bg-white p-3 md:p-4 rounded shadow mb-6 md:mb-8 space-y-3 border border-gray-200"
            >
              <h2 className="font-bold text-gray-700 border-b pb-2 text-sm md:text-base">
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
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!isConnected}
                  className="btn-primary bg-green-600 hover:bg-green-700 flex-1"
                >
                  {editId ? "Update Staff" : "Add Staff"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full sm:w-auto"
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
                  className="bg-white p-3 md:p-4 rounded shadow flex flex-col sm:flex-row sm:justify-between sm:items-center border-l-4 border-green-500 gap-3"
                >
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-base md:text-lg">
                      {item.person_name}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 font-semibold uppercase">
                      {item.department_name}
                    </p>
                    <p className="text-base md:text-lg font-mono text-gray-700">
                      {item.phone_number}
                    </p>
                  </div>
                  <div className="flex gap-3 sm:flex-col lg:flex-row">
                    <button
                      onClick={() => editOnCall(item)}
                      className="text-blue-600 font-bold text-sm hover:underline flex-1 sm:flex-none"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => deleteItem("oncall", item.id)}
                      className="text-red-600 font-bold text-sm hover:underline flex-1 sm:flex-none"
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
              className="bg-white p-3 md:p-4 rounded shadow mb-6 md:mb-8 space-y-3 border border-gray-200"
            >
              <h2 className="font-bold text-gray-700 border-b pb-2 text-sm md:text-base">
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
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!isConnected}
                  className="btn-primary bg-purple-600 hover:bg-purple-700 flex-1"
                >
                  {editId ? "Update Notice" : "Post Notice"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full sm:w-auto"
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
                  className="bg-white p-3 md:p-4 rounded shadow border-l-4 border-purple-400 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3"
                >
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-1 mb-1">
                      <p className="font-bold text-gray-800 text-base md:text-lg">
                        {item.title}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(item.notice_date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.text_content}
                    </p>
                  </div>
                  <div className="flex gap-3 sm:flex-col lg:flex-row sm:pl-2">
                    <button
                      onClick={() => editNotice(item)}
                      className="text-blue-600 font-bold text-sm hover:underline flex-1 sm:flex-none"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => deleteItem("notices", item.id)}
                      className="text-red-600 font-bold text-sm hover:underline flex-1 sm:flex-none"
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
          <>
            <div className="space-y-6">
              <div className="bg-red-50 p-4 md:p-6 rounded-xl border-2 border-red-200 shadow-inner">
                <h2 className="text-red-800 font-black text-lg md:text-xl mb-4 uppercase tracking-wide flex items-center gap-2">
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
                    className="w-full py-3 md:py-4 bg-red-600 text-white font-black text-base md:text-lg rounded shadow-lg hover:bg-red-700 active:scale-95 transition"
                  >
                    BROADCAST ALERT
                  </button>
                </form>
              </div>

              <button
                onClick={clearAllAlerts}
                disabled={!isConnected}
                className="w-full py-2 md:py-3 bg-gray-600 text-white font-bold text-sm md:text-base rounded hover:bg-gray-700 border border-gray-500"
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
                      className="bg-white p-3 md:p-4 rounded shadow border-l-8 border-red-600 flex flex-col sm:flex-row sm:justify-between sm:items-center animate-pulse gap-3"
                    >
                      <div className="flex-1">
                        <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-1 rounded uppercase">
                          {item.severity_level}
                        </span>
                        <p className="font-bold text-red-600 text-base md:text-lg mt-1">
                          {item.title}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissAlert(item.id)}
                        className="text-gray-500 text-xs border border-gray-300 px-3 py-2 rounded hover:bg-gray-100 hover:text-red-600 font-bold w-full sm:w-auto"
                      >
                        Dismiss
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* USER INFO DISPLAY - BOTTOM RIGHT */}
      {user && (
        <div className="fixed bottom-2 sm:bottom-3 md:bottom-4 right-2 sm:right-3 md:right-4 bg-slate-900 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg border border-slate-700 z-50">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-[10px] sm:text-xs">
              <p className="font-semibold">
                {user.displayName || user.primaryEmail || "User"}
              </p>
              {user.displayName && user.primaryEmail && (
                <p className="text-slate-400 text-[8px] sm:text-[10px]">
                  {user.primaryEmail}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, flagged, dismissed, completed

  // Fetch sessions from backend
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("http://localhost:5000/anticheat/sessions");
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        // Fallback to mock data if backend fails
        const mockSessions = [
          {
            sessionId: "sess_1735737600000",
            studentId: "student_1735737600000",
            subject: "JavaScript",
            status: "active",
            startTime: new Date(Date.now() - 300000).toISOString(),
            currentQuestion: 3,
            totalQuestions: 5,
            suspicionScore: 45,
            warningCount: 1,
            events: [
              { timestamp: new Date(Date.now() - 250000).toISOString(), eventType: "interview_started", details: { fullscreen: true } },
              { timestamp: new Date(Date.now() - 200000).toISOString(), eventType: "tab_switch", details: { reason: "Tab switched" } },
              { timestamp: new Date(Date.now() - 150000).toISOString(), eventType: "webcam_no_face_detected", details: { reason: "No face detected for 5 seconds" } },
            ]
          },
        ];
        setSessions(mockSessions);
      }
    };

    fetchSessions();
    
    // Refresh every 5 seconds for live monitoring
    const interval = setInterval(fetchSessions, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredSessions = sessions.filter(session => {
    if (filter === "all") return true;
    return session.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-700";
      case "flagged": return "bg-yellow-100 text-yellow-700";
      case "dismissed": return "bg-red-100 text-red-700";
      case "completed": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getSuspicionColor = (score) => {
    if (score >= 80) return "text-red-600 font-bold";
    if (score >= 50) return "text-yellow-600 font-semibold";
    return "text-green-600";
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (start, end) => {
    const duration = (new Date(end || Date.now()) - new Date(start)) / 1000 / 60;
    return `${Math.floor(duration)} min`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Monitor and review interview sessions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {sessions.filter(s => s.status === "active").length} Active
            </div>
            <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
              {sessions.filter(s => s.status === "flagged").length} Flagged
            </div>
            <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {sessions.filter(s => s.status === "dismissed").length} Dismissed
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {["all", "active", "flagged", "dismissed", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Interview Sessions</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredSessions.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No sessions found
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <motion.div
                      key={session.sessionId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition ${
                        selectedSession?.sessionId === session.sessionId ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status)}`}>
                              {session.status.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{session.subject}</span>
                            <span className="text-xs text-gray-500">{session.studentId}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>Started: {formatTimestamp(session.startTime)}</span>
                            <span>Duration: {formatDuration(session.startTime, session.endTime)}</span>
                            <span>Q: {session.currentQuestion}/{session.totalQuestions}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getSuspicionColor(session.suspicionScore)}`}>
                            {session.suspicionScore}
                          </div>
                          <div className="text-xs text-gray-500">Suspicion Score</div>
                          <div className="text-xs text-gray-600 mt-1">
                            ⚠️ {session.warningCount}/3 Warnings
                          </div>
                        </div>
                      </div>
                      {session.dismissalReason && (
                        <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          <strong>Dismissed:</strong> {session.dismissalReason}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="lg:col-span-1">
            {selectedSession ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Session Details</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Session ID</div>
                    <div className="text-sm font-mono text-gray-900">{selectedSession.sessionId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Student ID</div>
                    <div className="text-sm font-mono text-gray-900">{selectedSession.studentId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Subject</div>
                    <div className="text-sm font-medium text-gray-900">{selectedSession.subject}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedSession.status)}`}>
                      {selectedSession.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Progress</div>
                    <div className="text-sm text-gray-900">
                      Question {selectedSession.currentQuestion} of {selectedSession.totalQuestions}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(selectedSession.currentQuestion / selectedSession.totalQuestions) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Suspicion Score</div>
                    <div className={`text-3xl font-bold ${getSuspicionColor(selectedSession.suspicionScore)}`}>
                      {selectedSession.suspicionScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Warnings</div>
                    <div className="text-sm text-gray-900">
                      {selectedSession.warningCount} / 3
                    </div>
                  </div>
                </div>

                {/* Event Log */}
                <div className="border-t border-gray-200">
                  <div className="px-6 py-4 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900">Event Log</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {selectedSession.events.map((event, index) => (
                      <div key={index} className="px-6 py-3 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900">{event.eventType.replace(/_/g, " ").toUpperCase()}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{formatTimestamp(event.timestamp)}</div>
                            {event.details.reason && (
                              <div className="text-xs text-gray-600 mt-1">{event.details.reason}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">Select a session to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

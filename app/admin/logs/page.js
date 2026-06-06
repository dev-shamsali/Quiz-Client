'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { RefreshCw, ChevronDown, ChevronUp, Search } from 'lucide-react';

const EVENT_LABEL = {
  login:                 'Login',
  logout:                'Logout',
  quiz_started:          'Quiz Started',
  quiz_completed:        'Quiz Completed',
  quiz_abandoned:        'Quiz Abandoned',
  tab_switch:            'Tab Switch',
  window_blur:           'Window Blur',
  fullscreen_exit:       'Fullscreen Exit',
  browser_close_attempt: 'Close Attempt',
  visibility_hidden:     'Hidden',
  quiz_page_enter:       'Page Enter',
};

const VIOLATION_EVENTS = ['tab_switch', 'window_blur', 'fullscreen_exit', 'browser_close_attempt', 'visibility_hidden'];

const formatTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const groupByStudent = (logs) => {
  const map = {};
  logs.forEach((session) => {
    const id = session.student?._id || 'unknown';
    if (!map[id]) {
      map[id] = {
        studentId: id,
        name:  session.student?.name  || 'Unknown',
        email: session.student?.email || '',
        logs:  [],
      };
    }
    
    // Support new nested events structure
    if (session.events && Array.isArray(session.events) && session.events.length > 0) {
      session.events.forEach((evt) => {
        map[id].logs.push({
          _id: evt._id || `${session._id}_${evt.timestamp || evt.createdAt}`,
          event: evt.event,
          reason: evt.reason,
          createdAt: evt.timestamp || session.createdAt,
        });
      });
    } else {
      // Legacy flat structure support
      map[id].logs.push({
        _id: session._id,
        event: session.event,
        reason: session.reason,
        createdAt: session.createdAt,
      });
    }
  });

  // Sort events by timestamp descending (newest first) for each student
  Object.values(map).forEach((group) => {
    group.logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  });

  return Object.values(map);
};

export default function AdminLogsPage() {
  const [logs, setLogs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [pagination, setPagination]   = useState({ page: 1, pages: 1, total: 0 });
  const [emailSearch, setEmailSearch] = useState('');
  const [expanded, setExpanded]       = useState({}); // all collapsed by default

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50 });
      const { data } = await axios.get(`/api/activity-logs?${params}`);
      setLogs(data.data.logs);
      setPagination(data.data.pagination);
      // ── Do NOT auto-expand — start all collapsed ──────────────────────
      setExpanded({});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(1); }, []);

  const allGrouped = groupByStudent(logs);
  const grouped = emailSearch.trim()
    ? allGrouped.filter((g) => g.email.toLowerCase().includes(emailSearch.toLowerCase()))
    : allGrouped;

  // Toggle one student open/closed — others stay as they are
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        {(() => {
          const totalEvents = grouped.reduce((sum, g) => sum + g.logs.length, 0);
          return (
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
                <p className="text-gray-500 mt-1">{totalEvents} total events · {grouped.length} students</p>
              </div>
              <button onClick={() => fetchLogs(pagination.page)} className="btn btn-secondary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          );
        })()}

        {/* Search */}
        <div className="card card-body mb-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 w-full"
              placeholder="Search by student email..."
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
            />
          </div>
          {emailSearch && (
            <button onClick={() => setEmailSearch('')} className="text-sm text-red-500 hover:underline mt-2">
              Clear
            </button>
          )}
        </div>

        {/* Grouped list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">No logs found.</div>
        ) : (
          <div className="space-y-3">
            {grouped.map((group) => {
              const isOpen         = !!expanded[group.studentId];
              const violationCount = group.logs.filter((l) => VIOLATION_EVENTS.includes(l.event)).length;
              return (
                <div key={group.studentId} className="card overflow-hidden">

                  {/* Student header row — click to expand/collapse */}
                  <button
                    onClick={() => toggle(group.studentId)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-400">{group.email}</p>
                      </div>
                      <span className="text-xs text-gray-400 ml-1">{group.logs.length} events</span>
                      {violationCount > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-600 rounded">
                          {violationCount} violation{violationCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {/* Events table — only shown when expanded */}
                  {isOpen && (
                    <table className="w-full">
                      <thead className="bg-white border-b border-t border-gray-100">
                        <tr>
                          {['Event', 'Reason', 'Time'].map((h) => (
                            <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {group.logs.map((log) => {
                          const isViolation = VIOLATION_EVENTS.includes(log.event);
                          return (
                            <tr key={log._id} className="hover:bg-gray-50">
                              <td className="px-5 py-3">
                                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                  isViolation ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {EVENT_LABEL[log.event] || log.event}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-sm text-gray-500">{log.reason || '—'}</td>
                              <td className="px-5 py-3 text-sm text-gray-400 whitespace-nowrap">{formatTime(log.createdAt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button disabled={pagination.page === 1} onClick={() => fetchLogs(pagination.page - 1)} className="btn btn-secondary btn-sm">Prev</button>
              <button disabled={pagination.page === pagination.pages} onClick={() => fetchLogs(pagination.page + 1)} className="btn btn-secondary btn-sm">Next</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
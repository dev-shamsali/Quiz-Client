'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { getStudents, toggleResumeAttempt, forceSuspendAttempt } from '../../../store/slices/adminSlice';
import { Users, ChevronLeft, ChevronRight, PlayCircle, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const dispatch = useDispatch();
  const { students, studentsPagination, loading } = useSelector((s) => s.admin);

  useEffect(() => { dispatch(getStudents()); }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" /> Students
          </h1>
          <p className="text-gray-500 mt-1">{studentsPagination?.total ?? students.length} registered students</p>
        </div>

        <div className="card overflow-hidden border border-gray-150 shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Avg Score', 'Attempts', 'Joined', 'Exam Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>}
                {!loading && students.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-gray-400">No students registered yet.</td></tr>}
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold">
                          {s.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{s.email}</td>
                    <td className="px-5 py-3">
                      <span className={`font-bold text-sm ${s.averageScore >= 70 ? 'text-green-600' : s.averageScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {s.averageScore}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">{s.totalAttempts}</td>
                    <td className="px-5 py-3 text-sm text-gray-450">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {s.activeAttempt ? (
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold rounded-full border ${
                          s.activeAttempt.status === 'in-progress'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.activeAttempt.status === 'in-progress' ? 'bg-green-600' : 'bg-amber-500'}`} />
                          {s.activeAttempt.status === 'in-progress' ? 'In Progress' : 'Suspended'}
                          {s.activeAttempt.status === 'suspended' && s.activeAttempt.adminAllowedResume && ' (Resumable)'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">No Active Test</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {s.activeAttempt ? (
                        <div className="flex gap-2">
                          {s.activeAttempt.status === 'in-progress' && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to suspend ${s.name}'s test?`)) {
                                  dispatch(forceSuspendAttempt(s.activeAttempt._id))
                                    .then((res) => {
                                      if (res.error) toast.error(res.payload || 'Suspend failed');
                                      else toast.success('Exam suspended successfully');
                                    });
                                }
                              }}
                              className="btn border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 bg-red-50/50 hover:bg-red-50 btn-xs text-xs font-bold py-1.5 px-3 rounded-lg"
                            >
                              Suspend
                            </button>
                          )}
                          {s.activeAttempt.status === 'suspended' && (
                            <button
                              onClick={() => {
                                dispatch(toggleResumeAttempt(s.activeAttempt._id))
                                  .then((res) => {
                                    if (res.error) toast.error(res.payload || 'Failed to update resume state');
                                    else toast.success(s.activeAttempt.adminAllowedResume ? 'Resume status revoked' : 'Resume allowed');
                                  });
                              }}
                              className={`btn btn-xs text-xs font-bold py-1.5 px-3 rounded-lg border transition-all ${
                                s.activeAttempt.adminAllowedResume
                                  ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                  : 'border-primary-600 bg-primary-600 hover:bg-primary-700 text-white'
                              }`}
                            >
                              {s.activeAttempt.adminAllowedResume ? 'Revoke Resume' : 'Allow Resume'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 font-bold">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {studentsPagination && studentsPagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-sm text-gray-500">Page {studentsPagination.page} of {studentsPagination.pages}</p>
              <div className="flex gap-2">
                <button disabled={studentsPagination.page === 1}
                  onClick={() => dispatch(getStudents({ page: studentsPagination.page - 1 }))}
                  className="btn btn-secondary btn-sm"><ChevronLeft className="w-3.5 h-3.5" /> Prev</button>
                <button disabled={studentsPagination.page === studentsPagination.pages}
                  onClick={() => dispatch(getStudents({ page: studentsPagination.page + 1 }))}
                  className="btn btn-secondary btn-sm">Next <ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

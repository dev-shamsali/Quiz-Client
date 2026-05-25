'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { getStudents } from '../../../store/slices/adminSlice';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StudentsPage() {
  const dispatch = useDispatch();
  const { students, studentsPagination, loading } = useSelector((s) => s.admin);

  useEffect(() => { dispatch(getStudents()); }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" /> Students
          </h1>
          <p className="text-gray-500 mt-1">{studentsPagination?.total ?? students.length} registered students</p>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Email', 'Avg Score', 'Attempts', 'Joined', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>}
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
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
                  <td className="px-5 py-3 text-sm text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {studentsPagination && studentsPagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
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

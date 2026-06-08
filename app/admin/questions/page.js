'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { getQuestions, deleteQuestion } from '../../../store/slices/adminSlice';
import QuestionModal from '../../../components/admin/QuestionModal';
import { Plus, Search, Pencil, Trash2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['React.js', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'Problem Solving', 'Logical Reasoning', 'IQ'];
const DIFFICULTIES = ['easy', 'moderate', 'hard'];

export default function QuestionsPage() {
  const dispatch = useDispatch();
  const { questions, questionsPagination, loading } = useSelector((s) => s.admin);
  const [modal, setModal] = useState({ open: false, question: null });
  const [filters, setFilters] = useState({ difficulty: '', category: '', search: '', page: 1 });

  useEffect(() => { dispatch(getQuestions(filters)); }, [filters]);

  const handleDelete = (q) => {
    if (!confirm(`Deactivate "${q.question.slice(0, 60)}..."?`)) return;
    dispatch(deleteQuestion(q._id)).then((res) => {
      if (!res.error) toast.success('Question deactivated');
      else toast.error(res.payload || 'Delete failed');
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
            <p className="text-gray-500 mt-1">{questionsPagination?.total ?? questions.length} questions total</p>
          </div>
          <button onClick={() => setModal({ open: true, question: null })} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {/* Filters */}
        <div className="card card-body mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search questions..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
          </div>
          <select className="input w-auto" value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value, page: 1 })}>
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
          </select>
          <select className="input w-auto" value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Question', 'Category', 'Difficulty', 'Type', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading...</td></tr>
              )}
              {!loading && questions.map((q) => (
                <tr key={q._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 max-w-md">{q.question}</p>
                    {q.codeSnippet && <span className="text-xs text-gray-400">Has code snippet</span>}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{q.category}</td>
                  <td className="px-5 py-3"><span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span></td>
                  <td className="px-5 py-3"><span className="badge bg-gray-100 text-gray-600">{q.type}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setModal({ open: true, question: q })}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(q)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {questionsPagination && questionsPagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Page {questionsPagination.page} of {questionsPagination.pages}</p>
              <div className="flex gap-2">
                <button disabled={questionsPagination.page === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="btn btn-secondary btn-sm">Prev</button>
                <button disabled={questionsPagination.page === questionsPagination.pages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="btn btn-secondary btn-sm">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal.open && (
        <QuestionModal
          question={modal.question}
          onClose={() => setModal({ open: false, question: null })}
        />
      )}
    </DashboardLayout>
  );
}

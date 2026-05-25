'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createQuestion, updateQuestion } from '../../store/slices/adminSlice';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const defaultForm = {
  question: '', options: ['', '', '', ''], correctAnswer: '',
  explanation: '', difficulty: 'easy', category: 'React.js',
  technology: '', type: 'mcq', codeSnippet: '', estimatedTime: 60,
  realWorldUseCase: '', tags: '',
};

const CATEGORIES = ['React.js', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'Authentication & Security', 'Problem Solving', 'Debugging'];

export default function QuestionModal({ question, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(question ? {
    ...question, tags: question.tags?.join(', ') || ''
  } : defaultForm);
  const [saving, setSaving] = useState(false);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const setOption = (i, val) => setForm(prev => {
    const opts = [...prev.options];
    opts[i] = val;
    return { ...prev, options: opts };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };

    const action = question
      ? dispatch(updateQuestion({ id: question._id, data }))
      : dispatch(createQuestion(data));

    action.then((res) => {
      setSaving(false);
      if (res.error) toast.error(res.payload || 'Save failed');
      else { toast.success(question ? 'Question updated!' : 'Question created!'); onClose(); }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card w-full max-w-2xl">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-bold text-gray-900">{question ? 'Edit' : 'Add'} Question</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="card-body space-y-4 max-h-[80vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
              <textarea required rows={3} className="input resize-none" value={form.question}
                onChange={e => set('question', e.target.value)} placeholder="Enter the question..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Options * (4 required)</label>
              {form.options.map((opt, i) => (
                <input key={i} required className="input mb-2" placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt} onChange={e => setOption(i, e.target.value)} />
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
              <select required className="input" value={form.correctAnswer} onChange={e => set('correctAnswer', e.target.value)}>
                <option value="">Select correct option</option>
                {form.options.filter(Boolean).map((opt, i) => <option key={i} value={opt}>{opt.slice(0, 60)}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                <select required className="input" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select required className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="mcq">MCQ</option>
                  <option value="debugging">Debugging</option>
                  <option value="scenario">Scenario</option>
                  <option value="problem-solving">Problem Solving</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select required className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technology *</label>
                <input required className="input" placeholder="React, Node.js..." value={form.technology}
                  onChange={e => set('technology', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Explanation *</label>
              <textarea required rows={3} className="input resize-none" value={form.explanation}
                onChange={e => set('explanation', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code Snippet (optional)</label>
              <textarea rows={3} className="input resize-none font-mono text-sm" value={form.codeSnippet}
                onChange={e => set('codeSnippet', e.target.value)} placeholder="// paste code here" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input className="input" placeholder="hooks, useState, state" value={form.tags}
                onChange={e => set('tags', e.target.value)} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : (question ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

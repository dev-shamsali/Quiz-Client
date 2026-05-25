'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { fetchSettings, updateSettings } from '../../../store/slices/settingsSlice';
import { Settings, Calendar, ToggleLeft, ToggleRight, Download, BookOpen, Clock, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const dispatch = useDispatch();
  const { settings, saving } = useSelector((s) => s.settings);
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { dispatch(fetchSettings()); }, []);
  useEffect(() => {
    if (settings && !form) {
      setForm({
        quizAllowed: settings.quizAllowed ?? false,
        reportDownloadAllowed: settings.reportDownloadAllowed ?? false,
        quizDateTime: settings.quizDateTime
          ? new Date(settings.quizDateTime).toISOString().slice(0, 16)
          : '',
        quizDuration: settings.quizDuration ?? 45,
        syllabusTitle: settings.syllabusTitle ?? 'Quiz Syllabus',
        syllabusContent: settings.syllabusContent ?? '',
      });
    }
  }, [settings]);

  const handleSave = () => {
    const payload = {
      ...form,
      quizDateTime: form.quizDateTime ? new Date(form.quizDateTime).toISOString() : null,
    };
    dispatch(updateSettings(payload)).then((res) => {
      if (res.error) {
        toast.error(res.payload || 'Failed to save settings');
      } else {
        toast.success('Settings saved successfully');
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  };

  const Toggle = ({ field, label, description }) => (
    <div className="flex items-center justify-between p-5 border-2 border-ink/10 hover:border-ink/30 transition-colors">
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs text-ink-muted mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setForm(f => ({ ...f, [field]: !f[field] }))}
        className={`flex items-center gap-2 px-4 py-2 border-2 font-bold text-xs uppercase tracking-widest transition-all ${
          form[field]
            ? 'bg-ink text-cream border-ink'
            : 'bg-cream text-ink-muted border-ink/20 hover:border-ink'
        }`}
      >
        {form[field] ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
        {form[field] ? 'Enabled' : 'Disabled'}
      </button>
    </div>
  );

  if (!form) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-10 h-10 border-4 border-ink border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Settings size={26} /> Quiz Control</h1>
            <p className="text-ink-muted mt-1">Configure quiz access, schedule, and student settings</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saved ? <><CheckCircle size={14} /> Saved</> : saving ? 'Saving…' : <><Save size={14} /> Save Settings</>}
          </motion.button>
        </motion.div>

        <div className="space-y-6">
          {/* Quiz Access Controls */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card">
            <div className="card-header">
              <h2 className="font-bold">Access Controls</h2>
            </div>
            <div className="divide-y divide-ink/5">
              <Toggle
                field="quizAllowed"
                label="Quiz Open"
                description="Allow students to start the quiz. Disable to lock access."
              />
              <Toggle
                field="reportDownloadAllowed"
                label="Report Download"
                description="Allow students to download (print) their AI reports."
              />
            </div>
          </motion.div>

          {/* Quiz Schedule */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <div className="card-header flex items-center gap-2">
              <Calendar size={15} />
              <h2 className="font-bold">Quiz Schedule</h2>
            </div>
            <div className="card-body space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink-light block mb-2">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={form.quizDateTime}
                  onChange={(e) => setForm(f => ({ ...f, quizDateTime: e.target.value }))}
                  className="input w-full"
                />
                <p className="text-xs text-ink-faint mt-1">Displayed to students on their dashboard.</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink-light block mb-2">
                  <Clock size={11} className="inline mr-1" />Duration (minutes)
                </label>
                <input
                  type="number"
                  min={10}
                  max={180}
                  value={form.quizDuration}
                  onChange={(e) => setForm(f => ({ ...f, quizDuration: Number(e.target.value) }))}
                  className="input w-32"
                />
              </div>
            </div>
          </motion.div>

          {/* Syllabus */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
            <div className="card-header flex items-center gap-2">
              <BookOpen size={15} />
              <h2 className="font-bold">Syllabus</h2>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink-light block mb-2">
                  Syllabus Title
                </label>
                <input
                  type="text"
                  value={form.syllabusTitle}
                  onChange={(e) => setForm(f => ({ ...f, syllabusTitle: e.target.value }))}
                  className="input w-full"
                  placeholder="Quiz Syllabus"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink-light block mb-2">
                  Syllabus Content
                </label>
                <textarea
                  rows={10}
                  value={form.syllabusContent}
                  onChange={(e) => setForm(f => ({ ...f, syllabusContent: e.target.value }))}
                  className="input w-full resize-y"
                  placeholder="Enter syllabus topics, each on a new line…"
                />
                <p className="text-xs text-ink-faint mt-1">Displayed on the student dashboard. Use plain text or basic formatting.</p>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-end pb-8">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-8"
            >
              {saved ? <><CheckCircle size={14} /> Saved!</> : saving ? 'Saving…' : <><Save size={14} /> Save All Settings</>}
            </motion.button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

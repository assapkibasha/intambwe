import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import classService from '../../services/classService';
import subjectService from '../../services/subjectService';
import employeeService from '../../services/employeeService';

const emptyRow = { subjectId: '', teacherId: '', credit: '', totalMax: '' };

export default function AssignClassSubjectsAssignPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [cls, setCls] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [rows, setRows] = useState([emptyRow]);

  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [operationStatus, setOperationStatus] = useState(null);

  const showToast = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const fetchData = async () => {
    if (!classId) return;
    try {
      setLoading(true);
      setError(null);

      const [classRes, subjRes, teacherRes, assignRes] = await Promise.all([
        classService.getClassById(classId),
        subjectService.getAllSubjects(),
        employeeService.getAllEmployees({ role: 'teacher', limit: 1000 }),
        classService.getClassAssignments(classId),
      ]);

      const classData = classRes.data || classRes;
      setCls(classData || null);

      const subjData = subjRes.data || subjRes;
      setSubjects(Array.isArray(subjData) ? subjData : []);

      const teacherData = teacherRes.data || teacherRes;
      const teacherList = Array.isArray(teacherData) ? teacherData : teacherData?.data || [];
      setTeachers(teacherList.filter((t) => t.emp_role === 'teacher'));

      const assignData = assignRes.data || assignRes;
      setAssignments(Array.isArray(assignData) ? assignData : assignData?.data || []);
    } catch (err) {
      console.error('Failed to load assign-class-subjects data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const assignedSubjectIds = useMemo(() => assignments.map((a) => a.sbj_id), [assignments]);

  const handleRowChange = (index, field, value) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, emptyRow]);
  };

  const handleRemoveRow = (index) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSaveAssignments = async () => {
    if (!cls) return;

    const payloadAssignments = rows
      .filter((r) => r.subjectId && r.credit !== '' && r.totalMax !== '')
      .map((r) => ({
        sbj_id: parseInt(r.subjectId, 10),
        teacher_id: r.teacherId ? parseInt(r.teacherId, 10) : null,
        credit: parseInt(r.credit, 10),
        total_max: parseInt(r.totalMax, 10),
      }));

    if (payloadAssignments.length === 0) {
      showToast('warning', 'Please fill at least one valid row before saving.');
      return;
    }

    try {
      setOperationLoading(true);
      await classService.assignSubjectsToClass(cls.class_id, { assignments: payloadAssignments });
      showToast('success', 'Assignments saved successfully');
      await fetchData();
      setRows([emptyRow]);
    } catch (err) {
      console.error('Failed to save assignments:', err);
      showToast('error', err.message || 'Failed to save assignments');
    } finally {
      setOperationLoading(false);
    }
  };

  const RenderToast = () => {
    if (!operationStatus) return null;
    const { type, message } = operationStatus;
    const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertCircle;
    const colors = {
      success: 'bg-emerald-50 border-emerald-500 text-emerald-700',
      error: 'bg-red-50 border-red-500 text-red-700',
      warning: 'bg-yellow-50 border-yellow-500 text-yellow-700',
    };

    return (
      <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg border-l-4 shadow-lg ${colors[type]}`}>
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm">{message}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/employee/dashboard/assign-class-subjects')}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          {/* Back button */}
          <span className="mr-1">⟵</span>
          Back to Assign Class Subjects
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Assign Subjects to {cls?.class_name || ''}
            </h1>
            <button
              onClick={fetchData}
              className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {cls && (
              <p className="text-sm text-slate-600">
                Class: <span className="font-semibold">{cls.class_name}</span> | Department: {cls.Department?.dpt_name || cls.dpt_id || 'N/A'} | Trade: {cls.Trade?.trade_name || 'N/A'}
              </p>
            )}

            {assignments.length > 0 && (
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Already Assigned Subjects</h4>
                <div className="flex flex-wrap gap-2">
                  {assignments.map((a) => (
                    <span key={a.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                      {a.Subject?.sbj_name || `Subject #${a.sbj_id}`} (credit: {a.credit}, max: {a.total_max})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Max</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                      <td className="px-3 py-2">
                        <select
                          value={row.subjectId}
                          onChange={(e) => handleRowChange(index, 'subjectId', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select subject</option>
                          {subjects.map((s) => {
                            const disabled = assignedSubjectIds.includes(s.sbj_id);
                            return (
                              <option key={s.sbj_id} value={s.sbj_id} disabled={disabled}>
                                {s.sbj_name || s.sbj_code}
                                {disabled ? ' (already assigned)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={row.teacherId}
                          onChange={(e) => handleRowChange(index, 'teacherId', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select teacher</option>
                          {teachers.map((t) => (
                            <option key={t.emp_id} value={t.emp_id}>
                              {t.emp_name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          value={row.credit}
                          onChange={(e) => handleRowChange(index, 'credit', e.target.value)}
                          className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g. 3"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          value={row.totalMax}
                          onChange={(e) => handleRowChange(index, 'totalMax', e.target.value)}
                          className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g. 100"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                          disabled={rows.length === 1}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-3">
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add another row
              </button>
              <button
                type="button"
                onClick={handleSaveAssignments}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                disabled={operationLoading}
              >
                {operationLoading ? 'Saving...' : 'Save assignments'}
              </button>
            </div>
          </div>
        </div>

        <RenderToast />
      </div>
    </div>
  );
}

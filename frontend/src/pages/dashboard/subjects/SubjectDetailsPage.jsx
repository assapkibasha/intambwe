import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
import subjectService from '../../../services/subjectService';

export default function SubjectDetailsPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await subjectService.getSubjectById(subjectId);
      const data = res.data || res;
      setSubject(data || null);
    } catch (err) {
      const msg = err.message || 'Failed to load subject details';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/employee/dashboard/subjects')}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <span className="mr-1">⟵</span>
          Back to Subjects
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Subject Details
            </h1>
            <button
              type="button"
              onClick={fetchSubject}
              className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="px-6 py-5">
            {loading ? (
              <div className="py-10 text-center text-indigo-600 text-sm">Loading subject details...</div>
            ) : error ? (
              <div className="py-10 text-center text-red-600 text-sm flex flex-col items-center gap-2">
                <AlertCircle className="w-6 h-6" />
                <p>{error}</p>
              </div>
            ) : !subject ? (
              <div className="py-10 text-center text-slate-600 text-sm">Subject not found.</div>
            ) : (
              <div className="space-y-6 text-sm text-slate-800">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 mb-2">Basic Information</h2>
                  <p><span className="font-medium">ID:</span> {String(subject.sbj_id).padStart(4, '0')}</p>
                  <p><span className="font-medium">Name:</span> {subject.sbj_name}</p>
                  <p><span className="font-medium">Code:</span> {subject.sbj_code}</p>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-900 mb-2">Trades Learning This Subject</h2>
                  {Array.isArray(subject.trades) && subject.trades.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {subject.trades.map((trade) => (
                        <span
                          key={trade.trade_id}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700"
                        >
                          {trade.trade_name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No trades have been linked to this subject yet.</p>
                  )}
                </div>

                {/* Classes and teachers section (from backend subject.classAssignments) */}
                <div>
                  <h2 className="text-base font-semibold text-slate-900 mb-2">Classes Studying This Subject</h2>
                  {Array.isArray(subject.classAssignments) && subject.classAssignments.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Teacher</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Teacher (in this class)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subject.classAssignments.map((assignment, index) => {
                            const cls = assignment.Class || {};
                            const classTeacherName = cls.classTeacher?.emp_name || 'Not assigned';
                            const subjectTeacherName = assignment.assignedTeacher?.emp_name || 'Not assigned';

                            return (
                              <tr key={assignment.id || `${cls.class_id}-${index}`} className="border-t border-gray-100">
                                <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                                <td className="px-3 py-2 text-gray-900">{cls.class_name || 'N/A'}</td>
                                <td className="px-3 py-2 text-gray-700">{cls.Department?.dpt_name || cls.dpt_id || 'N/A'}</td>
                                <td className="px-3 py-2 text-gray-700">{cls.Trade?.trade_name || 'N/A'}</td>
                                <td className="px-3 py-2 text-gray-700">{classTeacherName}</td>
                                <td className="px-3 py-2 text-gray-700">{subjectTeacherName}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No classes have been linked to this subject yet.</p>
                  )}
                </div>

                <div className="text-xs text-gray-400 border-t pt-2">
                  This page shows the subject and any related trades/classes as provided by the backend.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

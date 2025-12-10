import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import classService from "../../../services/classService";

export default function ClassDetailsPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [cls, setCls] = useState(null);
  const [subjects, setSubjects] = useState([]); // actually class-subject assignments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!classId) return;
    try {
      setLoading(true);
      setError(null);

      const [classRes, subjectsRes] = await Promise.all([
        classService.getClassById(classId),
        classService.getClassAssignments(classId),
      ]);

      const classData = classRes?.data || classRes;
      const subjData = subjectsRes?.data || subjectsRes;

      setCls(classData || null);
      // subjectsRes is { success, data: [ClassSubject...] }
      setSubjects(Array.isArray(subjData) ? subjData : subjData?.data || []);
    } catch (err) {
      console.error("Failed to load class details:", err);
      setError(err.message || "Failed to load class details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const renderBody = () => {
    if (loading) {
      return (
        <div className="p-10 text-center text-indigo-600">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p>Loading class details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-10 text-center text-red-600 flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <p>{error}</p>
        </div>
      );
    }

    if (!cls) {
      return (
        <div className="p-10 text-center text-slate-600">
          Class not found.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <section className="space-y-2 text-sm text-slate-800">
          <h2 className="text-base font-semibold text-slate-900">Class Information</h2>
          <p>
            <span className="font-medium">Name:</span> {cls.class_name}
          </p>
          <p>
            <span className="font-medium">Department:</span>{" "}
            {cls.Department?.dpt_name || cls.dpt_id || "N/A"}
          </p>
          <p>
            <span className="font-medium">Trade:</span>{" "}
            {cls.Trade?.trade_name || "N/A"}
          </p>
          <p>
            <span className="font-medium">Class Teacher:</span>{" "}
            {cls.classTeacher?.emp_name || "Not assigned"}
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Subjects in this Class</h2>
          </div>

          {subjects.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-400" />
              <p>No subjects have been assigned to this class yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((item, index) => {
                    const subject = item.Subject || item; // from ClassSubject include
                    return (
                      <tr key={subject.sbj_id || index} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                        <td className="px-3 py-2 text-gray-700">{subject.sbj_code || "-"}</td>
                        <td className="px-3 py-2 text-gray-900">{subject.sbj_name || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/employee/dashboard/classes")}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Classes
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Class Details
            </h1>
            <button
              onClick={loadData}
              className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="px-6 py-5">{renderBody()}</div>
        </div>
      </div>
    </div>
  );
}

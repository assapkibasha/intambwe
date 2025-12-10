import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, RefreshCw, ChevronLeft, ChevronRight, Plus, AlertCircle, XCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import classService from '../../services/classService';
import { useEmployeeAuth } from '../../contexts/EmployeeAuthContext';

export default function AssignClassSubjectsPage() {
  const { employee } = useEmployeeAuth();
  const isAdmin = employee?.emp_role === 'admin';

  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const [operationLoading, setOperationLoading] = useState(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const classRes = await classService.getAllClasses();

      const classData = classRes.data || classRes;
      setClasses(Array.isArray(classData) ? classData : []);

    } catch (err) {
      console.error('Failed to load assign-class-subjects data:', err);
      setError(err.message || 'Failed to load data');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const openViewMoreModalForClass = (cls) => {
    if (!cls || !cls.class_id) return;
    navigate(`/employee/dashboard/assign-class-subjects/${cls.class_id}`);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredClasses = useMemo(() => {
    let result = [...classes];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(c => (c.class_name || '').toLowerCase().includes(q));
    }
    return result;
  }, [classes, searchTerm]);

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClasses = filteredClasses.slice(startIndex, endIndex);

  const openAssignPageForClass = (cls) => {
    if (!cls || !cls.class_id) return;
    navigate(`/employee/dashboard/assign-class-subjects/${cls.class_id}/assign`);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 py-6 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Access Restricted</h1>
          <p className="text-slate-600 text-sm">Only administrators can assign subjects to classes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            Assign Subjects to Classes
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={fetchInitialData}
              className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center border border-gray-100">
          <div className="relative flex-grow min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search classes by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-indigo-600">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Loading classes...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">
              <XCircle className="w-6 h-6 mx-auto mb-2" />
              <p>Error: {error}</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No Classes Available</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                There are currently no classes available to assign subjects to. Once classes are created, they will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['#', 'Class Name', 'Department', 'Trade', 'Class Teacher', 'Actions'].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentClasses.map((cls, index) => (
                      <tr key={cls.class_id} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cls.class_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {cls.Department?.dpt_name || cls.dpt_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {cls.Trade?.trade_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {cls.classTeacher?.emp_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openAssignPageForClass(cls)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Assign
                          </button>
                          <button
                            onClick={() => openViewMoreModalForClass(cls)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View more
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredClasses.length)} of {filteredClasses.length} classes
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals removed: Assign and View more are handled by dedicated pages. */}
    </div>
  );
}

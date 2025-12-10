// SubjectPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import subjectService from '../../services/subjectService';
import tradeService from '../../services/tradeService';
import { useEmployeeAuth } from '../../contexts/EmployeeAuthContext';

// Local toast/modal animation support only; all CRUD flows use dedicated pages.

const initialFormData = {
  sbj_name: '',
  sbj_code: '',
};

export default function SubjectPage() {
  const { employee } = useEmployeeAuth();
  const isAdmin = employee?.emp_role === 'admin';

  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Trade-related state
  const [trades, setTrades] = useState([]);
  const [tradeSearch, setTradeSearch] = useState('');
  const [selectedTradeIds, setSelectedTradeIds] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [formError, setFormError] = useState('');
  const [operationStatus, setOperationStatus] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchTerm.trim()) {
        params.query = searchTerm.trim();
      }
      const res = await subjectService.getAllSubjects(params);
      const data = res.data || res;
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError(err.message || 'Failed to load subjects. Check API connection.');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrades = async () => {
    try {
      const res = await tradeService.getAllTrades();
      const data = res.data || res;
      setTrades(Array.isArray(data) ? data : []);
    } catch (err) {
      // We won't block subject UI if trades fail; just leave list empty.
      console.error('Failed to fetch trades:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.sbj_name.trim() || !formData.sbj_code.trim()) {
      setFormError('Subject name and subject code are required');
      return;
    }

    const payload = {
      sbj_name: formData.sbj_name,
      sbj_code: formData.sbj_code,
      // trade_ids is for future backend support of many-to-many Subject-Trade relation
      trade_ids: selectedTradeIds,
    };

    try {
      setOperationLoading(true);

      if (showUpdateModal && selectedSubject) {
        await subjectService.updateSubject(selectedSubject.sbj_id, payload);
        showToast('success', 'Subject updated successfully');
        setShowUpdateModal(false);
      } else {
        await subjectService.createSubject(payload);
        showToast('success', 'Subject created successfully');
        setShowAddModal(false);
      }

      setFormData(initialFormData);
      setSelectedSubject(null);
      setSelectedTradeIds([]);
      await fetchSubjects();
    } catch (err) {
      const backendMessage = err.message || 'Operation failed';
      setFormError(backendMessage);
      showToast('error', backendMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (subject) => {
    try {
      setOperationLoading(true);
      await subjectService.deleteSubject(subject.sbj_id);
      showToast('success', 'Subject deleted successfully');
      setDeleteConfirm(null);
      await fetchSubjects();
    } catch (err) {
      const msg = err.message || 'Failed to delete subject';
      showToast('error', msg);
    } finally {
      setOperationLoading(false);
    }
  };

  const filteredSubjects = useMemo(() => {
    let result = [...subjects];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(s =>
        (s.sbj_name || '').toLowerCase().includes(q) ||
        (s.sbj_code || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [subjects, searchTerm]);

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubjects = filteredSubjects.slice(startIndex, endIndex);

  useEffect(() => {
    fetchSubjects();
    fetchTrades();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAdd = () => {
    navigate('/employee/dashboard/subjects/create');
  };

  const handleEdit = (subject) => {
    if (!subject?.sbj_id) return;
    navigate(`/employee/dashboard/subjects/${subject.sbj_id}/edit`);
  };

  const handleViewDetails = (subject) => {
    if (!subject?.sbj_id) return;
    navigate(`/employee/dashboard/subjects/${subject.sbj_id}`);
  };

  const RenderToast = () => {
    if (!operationStatus) return null;
    const { type, message } = operationStatus;
    const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertTriangle;
    const colors = {
      success: 'bg-emerald-50 border-emerald-500 text-emerald-700',
      error: 'bg-red-50 border-red-500 text-red-700',
      warning: 'bg-yellow-50 border-yellow-500 text-yellow-700',
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg border-l-4 shadow-lg ${colors[type]}`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm">{message}</p>
        </div>
      </motion.div>
    );
  };

  const renderEmptyState = () => (
    <div className="text-center py-12 bg-white rounded-lg border border-gray-100 mt-4">
      <AlertCircle className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-slate-900">No Subjects Found</h3>
      <p className="text-slate-500 mt-1">
        {searchTerm
          ? `No subjects match your search: "${searchTerm}".`
          : 'Start by adding a new subject to the system.'}
      </p>
      {!searchTerm && isAdmin && (
        <button
          onClick={handleAdd}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Subject
        </button>
      )}
    </div>
  );

  // Form rendering moved to dedicated pages; keep this component list-only.

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            Subject Management
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={fetchSubjects}
              className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition"
              disabled={loading || operationLoading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {isAdmin && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Subject
              </button>
            )}
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex justify-between items-center border border-gray-100">
          <div className="relative flex-grow mr-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subjects by name or code..."
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
              <p>Loading subjects...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">
              <XCircle className="w-6 h-6 mx-auto mb-2" />
              <p>Error: {error}</p>
            </div>
          ) : currentSubjects.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['ID', 'Name', 'Code', 'Trades', 'Actions'].map((header) => (
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
                    {currentSubjects.map((subject, index) => (
                      <motion.tr
                        key={subject.sbj_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-indigo-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{subject.sbj_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{subject.sbj_code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {Array.isArray(subject.trades) ? subject.trades.length : 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {isAdmin ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewDetails(subject)}
                                className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(subject)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 transition"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(subject)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">View only</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredSubjects.length)} of {filteredSubjects.length} results
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

      {/* Confirm Deletion Modal (still inline) */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  Confirm Deletion
                </h3>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">
                    Are you sure you want to delete this subject?
                  </h4>
                  <p className="text-sm text-slate-500 mb-6">
                    This action cannot be undone.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                      disabled={operationLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                      className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
                      disabled={operationLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RenderToast />
    </div>
  );
}

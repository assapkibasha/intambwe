import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Plus, Search, Edit, Trash2, Eye, ChevronDown, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, XCircle, X, AlertCircle, RefreshCw,
  Filter, Grid3X3, List, User, Calendar, Phone, Mail, School
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Combobox } from '@headlessui/react';

import studentService from '../../services/studentService';
import classService from '../../services/classService';

const StudentManagementDashboard = () => {
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('student_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [operationStatus, setOperationStatus] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classQuery, setClassQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    student_name: '',
    student_gender: 'Male',
    student_email: '',
    student_phone: '',
    student_dob: '',
    class_id: ''
  });
  const [formError, setFormError] = useState('');

  // Load data
  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await studentService.getAllStudents();
      const data = res.data || res;
      setAllStudents(data);
      setStudents(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load students');
      setAllStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await classService.getAllClasses();
      setClasses(res.data || res);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  const loadData = async () => {
    await Promise.all([loadStudents(), loadClasses()]);
  };

  // Filter & Sort
  useEffect(() => {
    let filtered = [...allStudents];

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_phone?.includes(searchTerm)
      );
    }

    filtered.sort((a, b) => {
      const aVal = (a[sortBy] || '').toString().toLowerCase();
      const bVal = (b[sortBy] || '').toString().toLowerCase();
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    setStudents(filtered);
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, allStudents]);

  const showToast = (type, message, duration = 3500) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  // Stats
  const totalStudents = allStudents.length;
  const boys = allStudents.filter(s => s.student_gender === 'Male').length;
  const girls = allStudents.filter(s => s.student_gender === 'Female').length;

  const filteredClasses = useMemo(() => {
    return classes.filter(c =>
      c.class_name?.toLowerCase().includes(classQuery.toLowerCase())
    );
  }, [classes, classQuery]);

  // CRUD Handlers
  const handleAddStudent = () => {
    setFormData({
      student_name: '',
      student_gender: 'Male',
      student_email: '',
      student_phone: '',
      student_dob: '',
      class_id: ''
    });
    setSelectedClass(null);
    setFormError('');
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.student_name || !formData.student_email || !selectedClass) {
      setFormError('Name, email, and class are required');
      return;
    }

    try {
      setOperationLoading(true);
      await studentService.createStudent({
        ...formData,
        class_id: selectedClass.class_id
      });
      await loadStudents();
      setShowAddModal(false);
      showToast('success', `${formData.student_name} added successfully!`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    const cls = classes.find(c => c.class_id === student.class_id);
    setSelectedClass(cls || null);
    setFormData({
      student_name: student.student_name || '',
      student_gender: student.student_gender || 'Male',
      student_email: student.student_email || '',
      student_phone: student.student_phone || '',
      student_dob: student.student_dob || '',
      class_id: student.class_id || ''
    });
    setFormError('');
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.student_name || !formData.student_email || !selectedClass) {
      setFormError('Name, email, and class are required');
      return;
    }

    try {
      setOperationLoading(true);
      await studentService.updateStudent(selectedStudent.student_id, {
        ...formData,
        class_id: selectedClass.class_id
      });
      await loadStudents();
      setShowUpdateModal(false);
      showToast('success', `${formData.student_name} updated successfully!`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (student) => {
    try {
      setOperationLoading(true);
      await studentService.deleteStudent(student.student_id);
      await loadStudents();
      setDeleteConfirm(null);
      showToast('success', `${student.student_name} deleted successfully`);
    } catch (err) {
      showToast('error', err.message || 'Failed to delete student');
    } finally {
      setOperationLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentStudents = students.slice(startIdx, startIdx + itemsPerPage);

  // Reusable Class Combobox
  const ClassSelect = ({ value, onChange }) => (
    <Combobox value={value} onChange={onChange}>
      <div className="relative">
        <Combobox.Label className="block text-sm font-medium text-gray-700 mb-1">
          Class *
        </Combobox.Label>
        <Combobox.Input
          className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          displayValue={(cls) => cls?.class_name || ''}
          onChange={(e) => setClassQuery(e.target.value)}
          placeholder="Search class..."
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6">
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </Combobox.Button>

        <AnimatePresence>
          {filteredClasses.length > 0 && (
            <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5">
              {filteredClasses.map((cls) => (
                <Combobox.Option
                  key={cls.class_id}
                  value={cls}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-primary-600 text-white' : 'text-gray-900'}`
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {cls.class_name}
                      </span>
                      {selected && (
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-primary-600'}`}>
                          <CheckCircle className="w-5 h-5" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </AnimatePresence>
      </div>
    </Combobox>
  );

  const getGenderColor = (gender) => {
    return gender === 'Male'
      ? 'bg-blue-100 text-blue-800'
      : gender === 'Female'
      ? 'bg-pink-100 text-pink-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <p className="text-sm text-gray-500">Manage all students in the system</p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleAddStudent}
                className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-lg shadow hover:bg-primary-700"
              >
                <Plus className="w-5 h-5" />
                Add Student
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Students', value: totalStudents, icon: Users, color: 'blue' },
            { label: 'Boys', value: boys, icon: User, color: 'sky' },
            { label: 'Girls', value: girls, icon: User, color: 'pink' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search & Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="student_name-asc">Name (A-Z)</option>
                <option value="student_name-desc">Name (Z-A)</option>
                <option value="student_email-asc">Email (A-Z)</option>
                <option value="student_email-desc">Email (Z-A)</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                {['table', 'grid', 'list'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-2 ${viewMode === mode ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {mode === 'table' && <List className="w-5 h-5" />}
                    {mode === 'grid' && <Grid3X3 className="w-5 h-5" />}
                    {mode === 'list' && <School className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentStudents.map((student) => {
                    const cls = classes.find(c => c.class_id === student.class_id);
                    return (
                      <motion.tr key={student.student_id} whileHover={{ backgroundColor: '#f9fafb' }}>
                        <td className="px-6 py-4 text-sm text-gray-900">{student.student_id}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{student.student_name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGenderColor(student.student_gender)}`}>
                            {student.student_gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{cls?.class_name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.student_email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.student_phone || '-'}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(student)} className="text-primary-600 hover:text-primary-800">
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} onClick={() => setDeleteConfirm(student)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-700">
                  Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, students.length)} of {students.length} students
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i+1}
                      onClick={() => setCurrentPage(i+1)}
                      className={`px-3 py-1 rounded ${currentPage === i+1 ? 'bg-primary-600 text-white' : 'border hover:bg-gray-100'}`}
                    >
                      {i+1}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grid & List views can be added similarly if needed */}

        {/* Toast */}
        <AnimatePresence>
          {operationStatus && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed top-20 right-6 z-50"
            >
              <div className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg text-white ${operationStatus.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {operationStatus.type === 'success' ? <CheckCircle /> : <XCircle />}
                <span>{operationStatus.message}</span>
                <button onClick={() => setOperationStatus(null)}><X className="w-5 h-5" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <Modal title="Add New Student" onClose={() => setShowAddModal(false)}>
              <form onSubmit={handleCreate} className="space-y-4">
                {formError && <div className="bg-red-100 text-red-700 p-3 rounded">{formError}</div>}
                <input name="student_name" placeholder="Full Name *" value={formData.student_name} onChange={handleInputChange} className="input" required />
                <select name="student_gender" value={formData.student_gender} onChange={handleInputChange} className="input">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input type="email" name="student_email" placeholder="Email *" value={formData.student_email} onChange={handleInputChange} className="input" required />
                <input type="tel" name="student_phone" placeholder="Phone" value={formData.student_phone} onChange={handleInputChange} className="input" />
                <input type="date" name="student_dob" placeholder="Date of Birth" value={formData.student_dob} onChange={handleInputChange} className="input" />
                <ClassSelect value={selectedClass} onChange={setSelectedClass} />
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                  <button type="submit" disabled={operationLoading} className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50">
                    {operationLoading ? 'Creating...' : 'Create Student'}
                  </button>
                </div>
              </form>
            </Modal>
          )}
        </AnimatePresence>

        {/* Update Modal */}
        <AnimatePresence>
          {showUpdateModal && (
            <Modal title="Update Student" onClose={() => setShowUpdateModal(false)}>
              <form onSubmit={handleUpdate} className="space-y-4">
                {formError && <div className="bg-red-100 text-red-700 p-3 rounded">{formError}</div>}
                <input name="student_name" value={formData.student_name} onChange={handleInputChange} className="input" required />
                <select name="student_gender" value={formData.student_gender} onChange={handleInputChange} className="input">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input type="email" name="student_email" value={formData.student_email} onChange={handleInputChange} className="input" required />
                <input type="tel" name="student_phone" value={formData.student_phone} onChange={handleInputChange} className="input" />
                <input type="date" name="student_dob" value={formData.student_dob} onChange={handleInputChange} className="input" />
                <ClassSelect value={selectedClass} onChange={setSelectedClass} />
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowUpdateModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                  <button type="submit" disabled={operationLoading} className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                    Update Student
                  </button>
                </div>
              </form>
            </Modal>
          )}
        </AnimatePresence>

        {/* Delete Confirm */}
        <AnimatePresence>
          {deleteConfirm && (
            <Modal title="Delete Student" onClose={() => setDeleteConfirm(null)}>
              <p>Are you sure you want to delete <strong>{deleteConfirm.student_name}</strong>? This cannot be undone.</p>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="px-6 py-2 bg-red-600 text-white rounded">Delete</button>
              </div>
            </Modal>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

// Simple reusable modal component
const Modal = ({ title, children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-xl p-6 w-full max-w-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

export default StudentManagementDashboard;
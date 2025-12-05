// src/pages/dashboard/employee/departmentDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  X,
  Loader2,
  CheckCircle,
} from 'lucide-react';

// CORRECT IMPORT PATH
import departmentService from '../../../services/departmentService';

const departmentDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({ dpt_name: '' });
  const [formErrors, setFormErrors] = useState({});

  // Load departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await departmentService.getAllDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load departments');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedDept(null);
    setFormData({ dpt_name: '' });
    setFormErrors({});
    setError('');
    setShowModal(true);
  };

  const handleEdit = (dept) => {
    setModalMode('edit');
    setSelectedDept(dept);
    setFormData({ dpt_name: dept.dpt_name || '' });
    setFormErrors({});
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" department?`)) return;

    try {
      setLoading(true);
      setError('');
      await departmentService.deleteDepartment(id);
      setSuccess('Department deleted successfully');
      await loadDepartments();
    } catch (err) {
      setError(err.message || 'Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    const name = formData.dpt_name.trim();

    if (!name) {
      errors.dpt_name = 'Department name is required';
    } else if (name.length < 2) {
      errors.dpt_name = 'Department name must be at least 2 characters';
    } else if (name.length > 100) {
      errors.dpt_name = 'Department name must not exceed 100 characters';
    }

    // Check duplicate (ignore current department when editing)
    const duplicate = departments.find(
      (d) =>
        d.dpt_name.toLowerCase() === name.toLowerCase() &&
        (modalMode === 'create' || d.dpt_id !== selectedDept?.dpt_id)
    );

    if (duplicate) {
      errors.dpt_name = 'This department name already exists';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const payload = { dpt_name: formData.dpt_name.trim() };

      if (modalMode === 'create') {
        await departmentService.createDepartment(payload);
        setSuccess('Department created successfully');
      } else {
        await departmentService.updateDepartment(selectedDept.dpt_id, payload);
        setSuccess('Department updated successfully');
      }

      setShowModal(false);
      await loadDepartments();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.dpt_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                Department Management
              </h1>
              <p className="text-gray-600">Manage your organization's departments</p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Department
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Departments</div>
              <div className="text-3xl font-bold text-gray-900">{departments.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Filtered Results</div>
              <div className="text-3xl font-bold text-gray-900">{filteredDepartments.length}</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <input
            type="text"
            placeholder="Search departments by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading && departments.length === 0 ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Loading departments...</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchTerm ? 'No departments found matching your search' : 'No departments available'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDepartments.map((dept) => (
                    <tr key={dept.dpt_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">#{dept.dpt_id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{dept.dpt_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(dept)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                            title="Edit Department"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dept.dpt_id, dept.dpt_name)}
                            className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                            title="Delete Department"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Create New Department' : 'Edit Department'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.dpt_name}
                      onChange={(e) => {
                        setFormData({ ...formData, dpt_name: e.target.value });
                        if (formErrors.dpt_name) setFormErrors({ ...formErrors, dpt_name: '' });
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        formErrors.dpt_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Human Resources"
                      disabled={loading}
                      maxLength={100}
                    />
                    {formErrors.dpt_name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.dpt_name}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.dpt_name.length}/100 characters
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading
                      ? 'Saving...'
                      : modalMode === 'create'
                      ? 'Create Department'
                      : 'Update Department'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default departmentDashboard;
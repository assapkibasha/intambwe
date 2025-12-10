import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  Heart,
  GraduationCap,
  FileText,
  Calendar,
  Edit,
  Printer,
  Download,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

// Import your service
import studentService from '../../../services/studentService'; // Adjust path if needed

const StudentViewPage = () => {
  const { id } = useParams(); // Get student ID from URL
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeSection, setActiveSection] = useState('all');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await studentService.getStudentById(id);
        
        // Handle different response shapes
        const student = data.data || data;

        // If photo is a path from backend, construct full URL if needed
        if (student.photo && !student.photo.startsWith('http') && !student.photo.startsWith('data:')) {
          student.std_image = `${process.env.REACT_APP_API_URL || ''}/uploads/students/${student.photo}`;
        } else {
          student.std_image = student.photo || null;
        }

        setStudentData(student);
      } catch (err) {
        console.error('Failed to load student:', err);
        setError('Failed to load student information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStudent();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    navigate(`/students/edit/${id}`);
  };

  const handleExport = () => {
    alert('Export to PDF feature coming soon!');
  };

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      Inactive: 'bg-gray-100 text-gray-800 border-gray-300',
      Transferred: 'bg-blue-100 text-blue-800 border-blue-300',
      Graduated: 'bg-blue-100 text-blue-800 border-blue-300',
      Suspended: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || colors['Active'];
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {Icon && <Icon className="text-blue-600 mt-1 flex-shrink-0" size={18} />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-base text-gray-900 mt-1 break-words">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  const sections = [
    { id: 'all', label: 'All Information', icon: FileText },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'contact', label: 'Contact', icon: MapPin },
    { id: 'guardian', label: 'Guardian', icon: Users },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'health', label: 'Health', icon: Heart }
  ];

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
          <p className="text-xl text-gray-600 mt-4">Loading student profile...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <XCircle className="text-red-500 mx-auto" size={64} />
          <p className="text-xl text-gray-700 mt-4">{error || 'Student not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 py-8 px-4">
      <div className=" mx-auto">
        {/* Header Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-all shadow-sm border border-gray-200"
          >
            <ArrowLeft size={20} />
            Back
          </button>
         
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <Edit size={18} />
              Edit Profile
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm border border-gray-200"
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm border border-gray-200"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Student Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-6">
              {/* Profile Header */}
              <div className="bg-gradient-to-br from-blue-600 via-sky-600 to-blue-600 px-6 py-8 text-center">
                <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg border-4 border-white">
                  {studentData.std_image ? (
                    <img src={studentData.std_image} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-gray-400" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">
                  {studentData.std_fname} {studentData.std_mname} {studentData.std_lname}
                </h2>
                <p className="text-blue-100 mt-1">Student ID: {studentData.std_id || studentData.admission_number}</p>
               
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 mt-4 ${getStatusColor(studentData.std_status || 'Active')}`}>
                  {studentData.std_status === 'Active' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  <span className="font-semibold">{studentData.std_status || 'Active'}</span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-semibold">{calculateAge(studentData.std_dob)} years old</p>
                  </div>
                </div>
               
                <div className="flex items-center gap-3 text-gray-700">
                  <GraduationCap className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-semibold">{studentData.class_name || `Class ${studentData.class_id}`}</p>
                  </div>
                </div>
               
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="text-blue-600" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold truncate">{studentData.std_email || 'Not provided'}</p>
                  </div>
                </div>
               
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold">{studentData.std_phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Section Navigation */}
              <div className="border-t border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Navigation</p>
                <div className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={18} />
                        {section.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            {(activeSection === 'all' || activeSection === 'personal') && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <User size={24} />
                    Personal Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoRow label="First Name" value={studentData.std_fname} icon={User} />
                    <InfoRow label="Middle Name" value={studentData.std_mname} icon={User} />
                    <InfoRow label="Last Name" value={studentData.std_lname} icon={User} />
                    <InfoRow label="Date of Birth" value={formatDate(studentData.std_dob)} icon={Calendar} />
                    <InfoRow label="Gender" value={studentData.std_gender} />
                    <InfoRow label="Nationality" value={studentData.std_nationality} />
                    <InfoRow label="Religion" value={studentData.std_religion} />
                    <InfoRow label="National ID" value={studentData.std_national_id} />
                    <InfoRow label="Place of Birth" value={studentData.std_place_of_birth} icon={MapPin} />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(activeSection === 'all' || activeSection === 'contact') && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapPin size={24} />
                    Contact Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoRow label="Phone Number" value={studentData.std_phone} icon={Phone} />
                    <InfoRow label="Email Address" value={studentData.std_email} icon={Mail} />
                    <InfoRow label="District" value={studentData.std_district} icon={MapPin} />
                    <InfoRow label="Country" value={studentData.std_country} icon={MapPin} />
                    <div className="md:col-span-2">
                      <InfoRow label="Full Address" value={studentData.std_address} icon={MapPin} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guardian Information */}
            {(activeSection === 'all' || activeSection === 'guardian') && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-pink-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users size={24} />
                    Parent/Guardian Information
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  {/* Father */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Users size={18} />
                      Father's Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Full Name" value={studentData.father_name} />
                      <InfoRow label="Phone Number" value={studentData.father_phone} icon={Phone} />
                      <div className="md:col-span-2">
                        <InfoRow label="National ID" value={studentData.father_national_id} />
                      </div>
                    </div>
                  </div>

                  {/* Mother */}
                  <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                    <h4 className="font-semibold text-pink-900 mb-3 flex items-center gap-2">
                      <Users size={18} />
                      Mother's Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Full Name" value={studentData.mother_name} />
                      <InfoRow label="Phone Number" value={studentData.mother_phone} icon={Phone} />
                      <div className="md:col-span-2">
                        <InfoRow label="National ID" value={studentData.mother_national_id} />
                      </div>
                    </div>
                  </div>

                  {/* Guardian */}
                  {(studentData.guardian_name || studentData.guardian_phone) && (
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                      <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                        <Users size={18} />
                        Guardian Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow label="Full Name" value={studentData.guardian_name} />
                        <InfoRow label="Phone Number" value={studentData.guardian_phone} icon={Phone} />
                        <div className="md:col-span-2">
                          <InfoRow label="Address" value={studentData.guardian_address} icon={MapPin} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <Phone size={18} />
                      Emergency Contact
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Contact Name" value={studentData.emergency_contact_name} />
                      <InfoRow label="Contact Phone" value={studentData.emergency_contact_phone} icon={Phone} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academic Information */}
            {(activeSection === 'all' || activeSection === 'academic') && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <GraduationCap size={24} />
                    Academic Information
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoRow label="Class" value={studentData.class_name || studentData.class_id} icon={GraduationCap} />
                    <InfoRow label="Academic Year" value={studentData.academic_year} icon={Calendar} />
                    <InfoRow label="Admission Number" value={studentData.admission_number} />
                    <InfoRow label="Enrollment Date" value={formatDate(studentData.enrollment_date)} icon={Calendar} />
                  </div>

                  {studentData.previous_school && (
                    <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
                      <h4 className="font-semibold text-sky-900 mb-3">Previous School Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow label="School Name" value={studentData.previous_school} />
                        <InfoRow label="School Address" value={studentData.previous_school_address} icon={MapPin} />
                        <InfoRow label="Last Grade Completed" value={studentData.last_grade_completed} />
                        <div className="md:col-span-2">
                          <InfoRow label="Reason for Transfer" value={studentData.transfer_reason} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Health Information */}
            {(activeSection === 'all' || activeSection === 'health') && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Heart size={24} />
                    Health Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <InfoRow label="Medical Conditions" value={studentData.medical_conditions || 'None'} icon={Heart} />
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                      <InfoRow label="Allergies" value={studentData.allergies || 'None'} icon={Heart} />
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                      <InfoRow label="Health Insurance" value={studentData.health_insurance || 'Not provided'} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {activeSection === 'all' && studentData.notes && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText size={24} />
                    Additional Notes
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed">{studentData.notes}</p>
                </div>
              </div>
            )}

            {/* System Info */}
            {activeSection === 'all' && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText size={24} />
                    System Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoRow label="Created On" value={formatDate(studentData.created_at)} icon={Calendar} />
                    <InfoRow label="Last Updated" value={formatDate(studentData.updated_at)} icon={Calendar} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print, .no-print * {
            display: none !important;
          }
          .lg\\:col-span-2, .lg\\:col-span-2 * {
            visibility: visible;
          }
          .lg\\:col-span-2 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentViewPage;
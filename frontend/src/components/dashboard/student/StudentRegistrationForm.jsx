import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  Heart,
  GraduationCap,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

// Import your services (adjust paths if needed)
import studentService from '../../../services/studentService';
import classService from '../../../services/classService';

const StudentRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    std_fname: '',
    std_mname: '',
    std_lname: '',
    std_email: '',
    std_dob: '',
    std_gender: '',
    std_nationality: '',
    std_religion: '',
    std_place_of_birth: '',
    std_national_id: '',
    std_phone: '',
    std_address: '',
    std_district: '',
    std_country: 'Rwanda',
    father_name: '',
    father_phone: '',
    father_national_id: '',
    mother_name: '',
    mother_phone: '',
    mother_national_id: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    class_id: '',
    academic_year: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    previous_school: '',
    previous_school_address: '',
    last_grade_completed: '',
    transfer_reason: '',
    medical_conditions: '',
    allergies: '',
    health_insurance: '',
    admission_number: '',
    notes: ''
  });

  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Keep raw file for FormData

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const response = await classService.getAllClasses();
        setClasses(Array.isArray(response) ? response : response.data || []);
      } catch (error) {
        console.error('Failed to load classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append all text fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value || '');
      });

      // Append photo if exists
      if (imageFile) {
        formDataToSend.append('photo', imageFile);
      }

      await studentService.createStudent(formDataToSend);

      alert('Student registered successfully!');
      // Optional: reset form or redirect
    } catch (error) {
      alert('Registration failed: ' + (error.message || 'Please try again'));
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Contact', icon: MapPin },
    { number: 3, title: 'Guardian', icon: Users },
    { number: 4, title: 'Academic', icon: GraduationCap },
    { number: 5, title: 'Health', icon: Heart },
    { number: 6, title: 'Other', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 py-8 px-4">
      <div className=" mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Student Registration</h1>
            <p className="text-blue-100 mt-2">Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-100 px-8 py-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;
                
                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-600'}`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div  className="p-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
                
                {/* Image Upload */}
                <div className="flex items-center gap-6 bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                      {image ? (
                        <img src={image} alt="Student" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-2">Upload a clear passport-size photo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input type="text" name="std_fname" value={formData.std_fname} onChange={handleChange} placeholder="e.g., John"  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                    <input type="text" name="std_mname" value={formData.std_mname} onChange={handleChange} placeholder="e.g., Peter" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input type="text" name="std_lname" value={formData.std_lname} onChange={handleChange} placeholder="e.g., Smith" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" name="std_email" value={formData.std_email} onChange={handleChange} placeholder="e.g., student@email.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                    <input type="date" name="std_dob" value={formData.std_dob} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select name="std_gender" value={formData.std_gender} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                    <input type="text" name="std_nationality" value={formData.std_nationality} onChange={handleChange} placeholder="e.g., Rwandan" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                    <input type="text" name="std_religion" value={formData.std_religion} onChange={handleChange} placeholder="e.g., Christian" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                    <input type="text" name="std_national_id" value={formData.std_national_id} onChange={handleChange} placeholder="e.g., 1198012345678910" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth</label>
                    <input type="text" name="std_place_of_birth" value={formData.std_place_of_birth} onChange={handleChange} placeholder="e.g., Kigali, Rwanda" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information - 100% YOUR ORIGINAL */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" name="std_phone" value={formData.std_phone} onChange={handleChange} placeholder="e.g., +250 788 123 456" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    <input type="text" name="std_district" value={formData.std_district} onChange={handleChange} placeholder="e.g., Gasabo" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                  <input type="text" name="std_address" value={formData.std_address} onChange={handleChange} placeholder="e.g., KG 123 St, Kimironko, Kigali" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input type="text" name="std_country" value={formData.std_country} onChange={handleChange} placeholder="e.g., Rwanda" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Please ensure all contact information is accurate for important communications.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Guardian Information - 100% YOUR ORIGINAL */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Parent/Guardian Information</h2>
                
                {/* Father */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="text-blue-600" size={20} />
                    Father's Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} placeholder="e.g., James Smith" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input type="tel" name="father_phone" value={formData.father_phone} onChange={handleChange} placeholder="e.g., +250 788 000 111" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                      <input type="text" name="father_national_id" value={formData.father_national_id} onChange={handleChange} placeholder="e.g., 1197012345678910" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                  </div>
                </div>

                {/* Mother */}
                <div className="bg-pink-50 p-6 rounded-xl border border-pink-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="text-pink-600" size={20} />
                    Mother's Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} placeholder="e.g., Mary Smith" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input type="tel" name="mother_phone" value={formData.mother_phone} onChange={handleChange} placeholder="e.g., +250 788 000 222" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                      <input type="text" name="mother_national_id" value={formData.mother_national_id} onChange={handleChange} placeholder="e.g., 1198012345678910" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                  </div>
                </div>

                {/* Guardian */}
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="text-emerald-600" size={20} />
                    Guardian Information (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input type="text" name="guardian_name" value={formData.guardian_name} onChange={handleChange} placeholder="e.g., Uncle John Doe" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input type="tel" name="guardian_phone" value={formData.guardian_phone} onChange={handleChange} placeholder="e.g., +250 788 000 333" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input type="text" name="guardian_address" value={formData.guardian_address} onChange={handleChange} placeholder="e.g., KG 456 St, Remera, Kigali" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Phone className="text-red-600" size={20} />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                      <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} placeholder="e.g., Dr. Sarah Johnson" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                      <input type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} placeholder="e.g., +250 788 999 999" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Academic Information - ONLY CHANGE: Real dropdown */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Academic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                    {loadingClasses ? (
                      <p className="text-gray-500">Loading classes...</p>
                    ) : (
                      <select
                        name="class_id"
                        value={formData.class_id}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select a class</option>
                        {classes.map((cls) => (
                          <option key={cls.class_id} value={cls.class_id}>
                            {cls.class_name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                    <input
                      type="text"
                      name="academic_year"
                      value={formData.academic_year}
                      onChange={handleChange}
                      placeholder="e.g., 2024-2025"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Date *</label>
                    <input
                      type="date"
                      name="enrollment_date"
                      value={formData.enrollment_date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admission Number</label>
                    <input
                      type="text"
                      name="admission_number"
                      value={formData.admission_number}
                      onChange={handleChange}
                      placeholder="e.g., STD-2024-001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <GraduationCap className="text-sky-600" size={20} />
                    Previous School Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Previous School Name</label>
                      <input type="text" name="previous_school" value={formData.previous_school} onChange={handleChange} placeholder="e.g., emerald Valley Primary School" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Previous School Address</label>
                      <input type="text" name="previous_school_address" value={formData.previous_school_address} onChange={handleChange} placeholder="e.g., Nyarugenge District, Kigali" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Grade Completed</label>
                      <input type="text" name="last_grade_completed" value={formData.last_grade_completed} onChange={handleChange} placeholder="e.g., Grade 5" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Transfer</label>
                      <input type="text" name="transfer_reason" value={formData.transfer_reason} onChange={handleChange} placeholder="e.g., Family relocation" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Health Information - 100% YOUR ORIGINAL */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Health Information</h2>
                
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Important:</strong> Please provide accurate health information to ensure proper care and safety.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                  <textarea name="medical_conditions" value={formData.medical_conditions} onChange={handleChange} rows="4" placeholder="e.g., Asthma, Diabetes, ADHD, or write 'None'" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                  <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows="4" placeholder="e.g., Peanut allergy, Penicillin, Pollen, or write 'None'" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Health Insurance</label>
                  <input type="text" name="health_insurance" value={formData.health_insurance} onChange={handleChange} placeholder="e.g., MMI Rwanda - Policy #12345678" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>
              </div>
            )}

            {/* Step 6: Other Information - 100% YOUR ORIGINAL */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows="8" placeholder="Any additional information, special requirements, dietary preferences..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>

                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-lg">
                  <h3 className="font-semibold text-emerald-800 mb-2">Review Your Information</h3>
                  <p className="text-sm text-emerald-700">
                    You're almost done! Please review all the information you've provided. Click "Previous" to make changes, or "Register Student" to submit.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Registration Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Student Name:</span>
                      <p className="font-medium">{formData.std_fname} {formData.std_mname} {formData.std_lname || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date of Birth:</span>
                      <p className="font-medium">{formData.std_dob || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Gender:</span>
                      <p className="font-medium">{formData.std_gender || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">{formData.std_phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{formData.std_email || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Enrollment Date:</span>
                      <p className="font-medium">{formData.enrollment_date}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }`}
              >
                <ArrowLeft size={20} />
                Previous
              </button>

              <div className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </div>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg font-medium"
                >
                  Next
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all hover:shadow-lg font-medium disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : (
                    <>
                      <Check size={20} />
                      Register Student
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StudentRegistrationForm;
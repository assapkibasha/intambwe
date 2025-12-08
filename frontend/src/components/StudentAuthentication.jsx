import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import student from "../../public/images/student.png"
import {
  FaUserGraduate,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaSignOutAlt,
  FaSchool,
  FaUsers,
  FaChild,
  FaIdBadge,
} from "react-icons/fa";
import Swal from "sweetalert2";

const StudentAuthentication = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    fullname: "",
    gender: "",
    classe: "",
    parentnames: "",
    age: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Common validation
    if (!formData.email || !formData.password) {
      Swal.fire({ icon: "error", title: "Oops!", text: "Email and password are required!" });
      return;
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({ icon: "error", title: "Invalid Email", text: "Please enter a valid email address!" });
      return;
    }

    // Password strength
    const passwordRegex = /^(?=.*\d).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      Swal.fire({
        icon: "error",
        title: "Weak Password",
        text: "Password must be at least 6 characters long and include a number.",
      });
      return;
    }

    // Signup validation
    if (!isLogin) {
      const { fullname, gender, classe, parentnames, age, confirmPassword, studentId } = formData;

      if (!fullname || !gender || !classe || !parentnames || !age || !studentId) {
        Swal.fire({ icon: "error", title: "Missing Fields", text: "Please fill in all fields!" });
        return;
      }

      if (age <= 0 || age > 100) {
        Swal.fire({ icon: "error", title: "Invalid Age", text: "Please enter a valid age!" });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Swal.fire({ icon: "error", title: "Password Mismatch", text: "Passwords do not match!" });
        return;
      }
    }

    // Mock login/signup success
    if (isLogin) {
      setIsAuthenticated(true);
      setUser({ name: "Student", email: formData.email, studentId: "STU20250" });
      Swal.fire({
        icon: "success",
        title: "Logged In!",
        text: `Welcome back, ${formData.email}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      setIsAuthenticated(true);
      setUser({ name: formData.fullname, email: formData.email, studentId: formData.studentId });
      Swal.fire({
        icon: "success",
        title: "Account Created!",
        text: `Welcome, ${formData.fullname}`,
        timer: 2000,
        showConfirmButton: false,
      });
      setIsLogin(true);
    }

    // Reset form
    setFormData({
      fullname: "",
      gender: "",
      classe: "",
      parentnames: "",
      age: "",
      email: "",
      password: "",
      confirmPassword: "",
      studentId: "",
    });
  };

  const handleGoogleAuth = () => {
    setIsAuthenticated(true);
    setUser({
      name: "Google User",
      email: "google@student.com",
      studentId: "GOOGLE123",
    });
    Swal.fire({
      icon: "success",
      title: "Logged In with Google!",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    Swal.fire({
      icon: "success",
      title: "Logged Out",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4 font-roboto">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* LEFT SIDE */}
        <motion.div initial="hidden" animate="visible" variants={container} className="text-center lg:text-left">
          <motion.div variants={item}>
            <FaSchool className="text-6xl text-blue-600 mx-auto lg:mx-0" />
          </motion.div>
          <motion.h1 variants={item} className="text-4xl font-bold mt-6">
            {isAuthenticated ? "Welcome Back!" : "Student Portal"}
          </motion.h1>
          <motion.p variants={item} className="text-gray-600 mt-4">
            Access your courses, assignments, materials, and school services.
          </motion.p>
        </motion.div>

        {/* RIGHT SIDE */}
        <AnimatePresence mode="wait">
          {isAuthenticated ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white p-8 rounded-2xl shadow border"
            >
              <div className="text-center">
                <FaUserGraduate className="text-5xl text-blue-500 mx-auto" />
                <h2 className="text-2xl font-bold mt-4">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="mt-4 bg-blue-50 px-4 py-2 rounded-full inline-flex items-center gap-2 text-blue-700">
                  <FaIdBadge /> {user?.studentId}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-8 flex items-center justify-center gap-3 bg-red-500 text-white py-3 rounded-xl"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={isLogin ? "login-form" : "signup-form"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white p-8 rounded-2xl shadow border"
            >
              <div className="text-center mb-8">
                <FaUserGraduate className="text-4xl text-blue-600 mx-auto" />
                <h2 className="text-3xl font-bold mt-3">{isLogin ? "Sign In" : "Create Account"}</h2>
                <p className="text-gray-600">
                  {isLogin ? "Login to continue your session" : "Fill in your student information"}
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit}>
                <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
                  {!isLogin && (
                    <>
                      <motion.div variants={item}>
                        <label className="flex items-center gap-2 font-medium mb-2">
                          <FaUser /> Fullname
                        </label>
                        <input
                          type="text"
                          name="fullname"
                          value={formData.fullname}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border rounded-xl focus:ring focus:ring-blue-200"
                          placeholder="Enter your fullname"
                        />
                      </motion.div>

                      <motion.div variants={item}>
                        <label className="flex items-center gap-2 font-medium mb-2">
                          <FaUsers /> Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border rounded-xl"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </motion.div>

                      <motion.div variants={item}>
                        <label className="flex items-center gap-2 font-medium mb-2">
                          <FaSchool /> Classe
                        </label>
                        <input
                          name="classe"
                          value={formData.classe}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border rounded-xl"
                          placeholder="e.g., S5 MCE"
                        />
                      </motion.div>

                      <motion.div variants={item}>
                        <label className="flex items-center gap-2 font-medium mb-2">
                          <FaIdBadge /> Student ID
                        </label>
                        <input
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border rounded-xl"
                          placeholder="Enter student ID"
                        />
                      </motion.div>

                      <motion.div variants={item}>
                        <label className="flex items-center gap-2 font-medium mb-2">
                          <FaUsers /> Parent Names
                        </label>
                        <input
                          name="parentnames"
                          value={formData.parentnames}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border rounded-xl"
                          placeholder="Enter parents' names"
                        />
                      </motion.div>

                      <motion.div variants={item}>
                        <label className="flex items-center gap-2 font-medium mb-2">
                          <FaChild /> Age
                        </label>
                        <input
                          name="age"
                          type="number"
                          value={formData.age}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border rounded-xl"
                          placeholder="Enter your age"
                        />
                      </motion.div>
                    </>
                  )}

                  <motion.div variants={item}>
                    <label className="flex items-center gap-2 font-medium mb-2">
                      <FaEnvelope /> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border rounded-xl"
                      placeholder="student@school.com"
                    />
                  </motion.div>

                  <motion.div variants={item}>
                    <label className="flex items-center gap-2 font-medium mb-2">
                      <FaLock /> Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-xl pr-12"
                        placeholder="Your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-500"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </motion.div>

                  {!isLogin && (
                    <motion.div variants={item}>
                      <label className="flex items-center gap-2 font-medium mb-2">
                        <FaLock /> Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border rounded-xl pr-12"
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-500"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    variants={item}
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-xl"
                  >
                    {isLogin ? "Sign In" : "Create Account"}
                  </motion.button>
                </motion.div>
              </form>

              <button
                onClick={handleGoogleAuth}
                className="w-full mt-5 flex items-center justify-center gap-2 border p-3 rounded-xl"
              >
                <FcGoogle className="text-xl" /> Continue with Google
              </button>

              <div className="mt-4 text-center">
                <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-medium">
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentAuthentication;

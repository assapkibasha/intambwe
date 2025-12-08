import api from '../api/api'; // Axios instance with JWT interceptor

class StudentAuthService {
  // SIGN UP
  async signup(credentials) {
    try {
      const response = await api.post('/student/auth/signup', credentials);
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Create an account failed';
      throw new Error(msg);
    }
  }

  // ✅ LOGIN (Added)
  async login(credentials) {
    try {
      const response = await api.post('/student/auth/login', credentials);
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Login failed';
      throw new Error(msg);
    }
  }

  // GOOGLE LOGIN
  async googleLogin(credential) {
    try {
      const response = await api.post('/student/auth/google', { credential });
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'Google login failed';
      throw new Error(msg);
    }
  }

  // REFRESH TOKEN
  async refreshToken(refreshToken) {
    try {
      const response = await api.post('/student/auth/refresh-token', { refreshToken });
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Token refresh failed';
      throw new Error(msg);
    }
  }

  // LOGOUT
  async logout() {
    try {
      const response = await api.post('/student/auth/logout');
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Logout failed';
      throw new Error(msg);
    }
  }

  // GET PROFILE
  async getProfile() {
    try {
      const response = await api.get('/student/auth/profile');
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to load profile';
      throw new Error(msg);
    }
  }

  // UPDATE PROFILE
  async updateProfile(std_Id, data) {
    try {
      const response = await api.put(`/student/${std_Id}`, data);
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to update profile';
      throw new Error(msg);
    }
  }

  // CHANGE PASSWORD
  async changePassword(data) {
    try {
      const response = await api.post('/student/auth/change-password', data);
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to change password';
      throw new Error(msg);
    }
  }

  // FORGOT PASSWORD
  async forgotPassword(email) {
    try {
      const response = await api.post('/student/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to send reset request';
      throw new Error(msg);
    }
  }

  // RESET PASSWORD
  async resetPassword(resetToken, newPassword) {
    try {
      const response = await api.post('/student/auth/reset-password', {
        resetToken,
        newPassword,
      });
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to reset password';
      throw new Error(msg);
    }
  }

  // VERIFY TOKEN
  async verifyToken() {
    try {
      const response = await api.get('/student/auth/verify-token');
      return response.data;
    } catch (error) {
      return { success: false, message: 'Invalid token' };
    }
  }
}

const studentAuthService = new StudentAuthService();
export default studentAuthService;

// Optional named exports
export const {
  signup,
  login,       // <- added login here
  googleLogin,
  refreshToken,
  logout,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyToken,
} = studentAuthService;

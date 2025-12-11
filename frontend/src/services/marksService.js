import api from "../api/api"; // Axios instance with JWT interceptor

class MarksService {
  // CREATE or UPDATE via POST (Upsert behavior)
  async createOrUpdateMarks(data) {
    try {
      const response = await api.post("/marks", data);
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to save marks";
      throw new Error(msg);
    }
  }

  // GET ALL MARKS (supports filters)
  async getMarks(filters = {}) {
    try {
      const response = await api.get("/marks", { params: filters });
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load marks";
      throw new Error(msg);
    }
  }

  // GET MARKS BY ID
  async getMarksById(id) {
    try {
      const response = await api.get(`/marks/${id}`);
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load marks record";
      throw new Error(msg);
    }
  }

  // UPDATE MARKS (PUT)
  async updateMarks(id, data) {
    try {
      const response = await api.put(`/marks/${id}`, data);
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update marks";
      throw new Error(msg);
    }
  }

  // PATCH (partial update)
  async patchMarks(id, data) {
    try {
      const response = await api.patch(`/marks/${id}`, data);
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update marks";
      throw new Error(msg);
    }
  }

  // DELETE MARKS
  async deleteMarks(id) {
    try {
      const response = await api.delete(`/marks/${id}`);
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete marks";
      throw new Error(msg);
    }
  }

  // GET STUDENT TRANSCRIPT
  async getStudentTranscript(std_id, params = {}) {
    try {
      const response = await api.get(`/marks/student/${std_id}/transcript`, {
        params,
      });
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load student transcript";
      throw new Error(msg);
    }
  }
}

const marksService = new MarksService();
export default marksService;

// Optional named exports
export const {
  createOrUpdateMarks,
  getMarks,
  getMarksById,
  updateMarks,
  patchMarks,
  deleteMarks,
  getStudentTranscript,
} = marksService;

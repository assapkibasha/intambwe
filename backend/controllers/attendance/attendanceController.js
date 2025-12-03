const { Attendance, Student, Class, Subject } = require('../../model');
const { Op } = require('sequelize');
const attendanceValidator = require('../../validators/attendanceValidator');

const attendanceController = {
  async recordAttendance(req, res) {
    try {
      const data = req.body;
      
      const validation = attendanceValidator.validateAttendanceData(data);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const student = await Student.findByPk(data.student_id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const classObj = await Class.findByPk(data.class_id);
      if (!classObj) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      if (data.subject_id) {
        const subject = await Subject.findByPk(data.subject_id);
        if (!subject) {
          return res.status(404).json({
            success: false,
            message: 'Subject not found'
          });
        }
      }

      const existing = await Attendance.findOne({
        where: {
          student_id: data.student_id,
          class_id: data.class_id,
          subject_id: data.subject_id || null,
          date: data.date
        }
      });

      if (existing) {
        await existing.update(data);
        return res.status(200).json({
          success: true,
          message: 'Attendance updated successfully',
          data: existing
        });
      }

      const attendance = await Attendance.create(data);

      return res.status(201).json({
        success: true,
        message: 'Attendance recorded successfully',
        data: attendance
      });
    } catch (error) {
      console.error('Error recording attendance:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getAttendance(req, res) {
    try {
      const {
        student_id,
        class_id,
        subject_id,
        status,
        start_date,
        end_date,
        page = 1,
        limit = 20
      } = req.query;

      const whereClause = {};
      if (student_id) whereClause.student_id = student_id;
      if (class_id) whereClause.class_id = class_id;
      if (subject_id) whereClause.subject_id = subject_id;
      if (status) whereClause.status = status;

      if (start_date || end_date) {
        whereClause.date = {};
        if (start_date) whereClause.date[Op.gte] = start_date;
        if (end_date) whereClause.date[Op.lte] = end_date;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Attendance.findAndCountAll({
        where: whereClause,
        include: [
          { model: Student },
          { model: Class },
          { model: Subject }
        ],
        order: [['date', 'DESC'], ['time_in', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getAttendanceById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid attendance ID'
        });
      }

      const attendance = await Attendance.findByPk(id, {
        include: [
          { model: Student },
          { model: Class },
          { model: Subject }
        ]
      });

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: attendance
      });
    } catch (error) {
      console.error('Error fetching attendance record:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async updateAttendance(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid attendance ID'
        });
      }

      const attendance = await Attendance.findByPk(id);
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      const validation = attendanceValidator.validateAttendanceData(updateData, true);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      await attendance.update(updateData);

      const updated = await Attendance.findByPk(id, {
        include: [
          { model: Student },
          { model: Class },
          { model: Subject }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: updated
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async deleteAttendance(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid attendance ID'
        });
      }

      const attendance = await Attendance.findByPk(id);
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      await attendance.destroy();

      return res.status(200).json({
        success: true,
        message: 'Attendance record deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting attendance:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getStudentAttendanceSummary(req, res) {
    try {
      const { student_id } = req.params;
      const { start_date, end_date } = req.query;

      if (!student_id || isNaN(student_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const whereClause = { student_id };
      if (start_date || end_date) {
        whereClause.date = {};
        if (start_date) whereClause.date[Op.gte] = start_date;
        if (end_date) whereClause.date[Op.lte] = end_date;
      }

      const records = await Attendance.findAll({ where: whereClause });

      const summary = {
        total: records.length,
        present: records.filter(r => r.status === 'PRESENT').length,
        absent: records.filter(r => r.status === 'ABSENT').length,
        late: records.filter(r => r.status === 'LATE').length
      };

      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = attendanceController;

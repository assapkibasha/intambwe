const { Marks, Student, Subject, Class, Employee } = require('../../model');
const { Op } = require('sequelize');
const marksValidator = require('../../validators/marksValidator');

const marksController = {
  async createMarks(req, res) {
    try {
      const data = req.body;
      
      const validation = marksValidator.validateMarksData(data);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const student = await Student.findByPk(data.std_id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const subject = await Subject.findByPk(data.sbj_id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      if (data.class_id) {
        const classObj = await Class.findByPk(data.class_id);
        if (!classObj) {
          return res.status(404).json({
            success: false,
            message: 'Class not found'
          });
        }
      }

      if (data.emp_id) {
        const teacher = await Employee.findByPk(data.emp_id);
        if (!teacher) {
          return res.status(404).json({
            success: false,
            message: 'Employee not found'
          });
        }
      }

      const existing = await Marks.findOne({
        where: {
          std_id: data.std_id,
          sbj_id: data.sbj_id,
          semester: data.semester || null,
          ac_year: data.ac_year || null
        }
      });

      if (existing) {
        await existing.update(data);
        return res.status(200).json({
          success: true,
          message: 'Marks updated successfully',
          data: existing
        });
      }

      const marks = await Marks.create(data);

      return res.status(201).json({
        success: true,
        message: 'Marks recorded successfully',
        data: marks
      });
    } catch (error) {
      console.error('Error creating marks:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getMarks(req, res) {
    try {
      const {
        std_id,
        sbj_id,
        class_id,
        semester,
        ac_year,
        page = 1,
        limit = 20
      } = req.query;

      const whereClause = {};
      if (std_id) whereClause.std_id = std_id;
      if (sbj_id) whereClause.sbj_id = sbj_id;
      if (class_id) whereClause.class_id = class_id;
      if (semester) whereClause.semester = semester;
      if (ac_year) whereClause.ac_year = ac_year;

      const offset = (page - 1) * limit;

      const { count, rows } = await Marks.findAndCountAll({
        where: whereClause,
        include: [
          { model: Student },
          { model: Subject },
          { model: Class },
          { model: Employee, as: 'gradedBy' }
        ],
        order: [['date_recorded', 'DESC']],
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
      console.error('Error fetching marks:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getMarksById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid marks ID'
        });
      }

      const marks = await Marks.findByPk(id, {
        include: [
          { model: Student },
          { model: Subject },
          { model: Class },
          { model: Employee, as: 'gradedBy' }
        ]
      });

      if (!marks) {
        return res.status(404).json({
          success: false,
          message: 'Marks record not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: marks
      });
    } catch (error) {
      console.error('Error fetching marks record:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async updateMarks(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid marks ID'
        });
      }

      const marks = await Marks.findByPk(id);
      if (!marks) {
        return res.status(404).json({
          success: false,
          message: 'Marks record not found'
        });
      }

      const validation = marksValidator.validateMarksData(updateData, true);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      await marks.update(updateData);

      const updated = await Marks.findByPk(id, {
        include: [
          { model: Student },
          { model: Subject },
          { model: Class },
          { model: Employee, as: 'gradedBy' }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Marks updated successfully',
        data: updated
      });
    } catch (error) {
      console.error('Error updating marks:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async deleteMarks(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid marks ID'
        });
      }

      const marks = await Marks.findByPk(id);
      if (!marks) {
        return res.status(404).json({
          success: false,
          message: 'Marks record not found'
        });
      }

      await marks.destroy();

      return res.status(200).json({
        success: true,
        message: 'Marks record deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting marks:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getStudentTranscript(req, res) {
    try {
      const { std_id } = req.params;
      const { ac_year } = req.query;

      if (!std_id || isNaN(std_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const whereClause = { std_id };
      if (ac_year) whereClause.ac_year = ac_year;

      const records = await Marks.findAll({
        where: whereClause,
        include: [
          { model: Subject },
          { model: Class }
        ],
        order: [['semester', 'ASC'], ['date_recorded', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = marksController;

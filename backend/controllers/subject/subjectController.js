const { Subject, Department, Class, Employee } = require('../../model');
const { Op } = require('sequelize');
const subjectValidator = require('../../validators/subjectValidator');

const subjectController = {
  async createSubject(req, res) {
    try {
      const data = req.body;
      
      const validation = subjectValidator.validateSubjectData(data);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const existing = await Subject.findOne({ where: { sbj_code: data.sbj_code } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Subject code already exists'
        });
      }

      if (data.dpt_id) {
        const department = await Department.findByPk(data.dpt_id);
        if (!department) {
          return res.status(404).json({
            success: false,
            message: 'Department not found'
          });
        }
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

      if (data.teacher_id) {
        const teacher = await Employee.findByPk(data.teacher_id);
        if (!teacher) {
          return res.status(404).json({
            success: false,
            message: 'Employee not found'
          });
        }
      }

      const subject = await Subject.create(data);

      return res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: subject
      });
    } catch (error) {
      console.error('Error creating subject:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getAllSubjects(req, res) {
    try {
      const { dpt_id, class_id, teacher_id, query } = req.query;

      const whereClause = {};
      if (dpt_id) whereClause.dpt_id = dpt_id;
      if (class_id) whereClause.class_id = class_id;
      if (teacher_id) whereClause.teacher_id = teacher_id;

      if (query && query.trim().length > 0) {
        whereClause[Op.or] = [
          { sbj_name: { [Op.like]: `%${query}%` } },
          { sbj_code: { [Op.like]: `%${query}%` } }
        ];
      }

      const subjects = await Subject.findAll({
        where: whereClause,
        include: [
          { model: Department },
          { model: Class },
          { model: Employee, as: 'teacher' }
        ],
        order: [['sbj_name', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: subjects
      });
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getSubjectById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subject ID'
        });
      }

      const subject = await Subject.findByPk(id, {
        include: [
          { model: Department },
          { model: Class },
          { model: Employee, as: 'teacher' }
        ]
      });

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: subject
      });
    } catch (error) {
      console.error('Error fetching subject:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async updateSubject(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subject ID'
        });
      }

      const subject = await Subject.findByPk(id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      const validation = subjectValidator.validateSubjectData(updateData, true);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      if (updateData.sbj_code && updateData.sbj_code !== subject.sbj_code) {
        const existing = await Subject.findOne({ where: { sbj_code: updateData.sbj_code } });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'Subject code already exists'
          });
        }
      }

      if (updateData.dpt_id) {
        const department = await Department.findByPk(updateData.dpt_id);
        if (!department) {
          return res.status(404).json({
            success: false,
            message: 'Department not found'
          });
        }
      }

      if (updateData.class_id) {
        const classObj = await Class.findByPk(updateData.class_id);
        if (!classObj) {
          return res.status(404).json({
            success: false,
            message: 'Class not found'
          });
        }
      }

      if (updateData.teacher_id) {
        const teacher = await Employee.findByPk(updateData.teacher_id);
        if (!teacher) {
          return res.status(404).json({
            success: false,
            message: 'Employee not found'
          });
        }
      }

      await subject.update(updateData);

      const updated = await Subject.findByPk(id, {
        include: [
          { model: Department },
          { model: Class },
          { model: Employee, as: 'teacher' }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Subject updated successfully',
        data: updated
      });
    } catch (error) {
      console.error('Error updating subject:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async deleteSubject(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subject ID'
        });
      }

      const subject = await Subject.findByPk(id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      await subject.destroy();

      return res.status(200).json({
        success: true,
        message: 'Subject deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = subjectController;

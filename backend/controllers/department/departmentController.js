const { Department, Class, Employee, Student, Subject } = require('../../model');

const departmentController = {
  async createDepartment(req, res) {
    try {
      const data = req.body;

      if (!data.dpt_name) {
        return res.status(400).json({
          success: false,
          message: 'dpt_name is required'
        });
      }

      const existing = await Department.findOne({ where: { dpt_name: data.dpt_name } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Department name already exists'
        });
      }

      const department = await Department.create(data);

      return res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: department
      });
    } catch (error) {
      console.error('Error creating department:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getAllDepartments(req, res) {
    try {
      const departments = await Department.findAll({
        order: [['dpt_name', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: departments
      });
    } catch (error) {
      console.error('Error fetching departments:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getDepartmentById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department ID'
        });
      }

      const department = await Department.findByPk(id);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: department
      });
    } catch (error) {
      console.error('Error fetching department:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department ID'
        });
      }

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      if (updateData.dpt_name && updateData.dpt_name !== department.dpt_name) {
        const existing = await Department.findOne({ where: { dpt_name: updateData.dpt_name } });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'Department name already exists'
          });
        }
      }

      await department.update(updateData);

      return res.status(200).json({
        success: true,
        message: 'Department updated successfully',
        data: department
      });
    } catch (error) {
      console.error('Error updating department:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async deleteDepartment(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department ID'
        });
      }

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      await department.destroy();

      return res.status(200).json({
        success: true,
        message: 'Department deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getDepartmentOverview(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department ID'
        });
      }

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      const [classes, employees, students, subjects] = await Promise.all([
        Class.findAll({ where: { dpt_id: id } }),
        Employee.findAll({ where: { dpt_id: id } }),
        Student.findAll({ where: { dpt_id: id } }),
        Subject.findAll({ where: { dpt_id: id } })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          department,
          classesCount: classes.length,
          employeesCount: employees.length,
          studentsCount: students.length,
          subjectsCount: subjects.length
        }
      });
    } catch (error) {
      console.error('Error fetching department overview:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = departmentController;

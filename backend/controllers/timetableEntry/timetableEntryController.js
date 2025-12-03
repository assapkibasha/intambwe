const { TimetableEntry, Timetable, Class, Subject, Employee } = require('../../model');
const timetableEntryValidator = require('../../validators/timetableEntryValidator');

const timetableEntryController = {
  async createEntry(req, res) {
    try {
      const data = req.body;
      
      const validation = timetableEntryValidator.validateEntryData(data);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const timetable = await Timetable.findByPk(data.timetable_id);
      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: 'Timetable not found'
        });
      }

      const classObj = await Class.findByPk(data.class_id);
      if (!classObj) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      if (data.sbj_id) {
        const subject = await Subject.findByPk(data.sbj_id);
        if (!subject) {
          return res.status(404).json({
            success: false,
            message: 'Subject not found'
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

      const entry = await TimetableEntry.create(data);

      return res.status(201).json({
        success: true,
        message: 'Timetable entry created successfully',
        data: entry
      });
    } catch (error) {
      console.error('Error creating timetable entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getEntries(req, res) {
    try {
      const { timetable_id, class_id, teacher_id, day_of_week } = req.query;

      const whereClause = {};
      if (timetable_id) whereClause.timetable_id = timetable_id;
      if (class_id) whereClause.class_id = class_id;
      if (teacher_id) whereClause.teacher_id = teacher_id;
      if (day_of_week) whereClause.day_of_week = day_of_week;

      const entries = await TimetableEntry.findAll({
        where: whereClause,
        include: [
          { model: Timetable },
          { model: Class },
          { model: Subject },
          { model: Employee, as: 'teacher' }
        ],
        order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: entries
      });
    } catch (error) {
      console.error('Error fetching timetable entries:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getEntryById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid entry ID'
        });
      }

      const entry = await TimetableEntry.findByPk(id, {
        include: [
          { model: Timetable },
          { model: Class },
          { model: Subject },
          { model: Employee, as: 'teacher' }
        ]
      });

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Timetable entry not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: entry
      });
    } catch (error) {
      console.error('Error fetching timetable entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async updateEntry(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid entry ID'
        });
      }

      const entry = await TimetableEntry.findByPk(id);
      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Timetable entry not found'
        });
      }

      const validation = timetableEntryValidator.validateEntryData(updateData, true);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      if (updateData.timetable_id) {
        const timetable = await Timetable.findByPk(updateData.timetable_id);
        if (!timetable) {
          return res.status(404).json({
            success: false,
            message: 'Timetable not found'
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

      if (updateData.sbj_id) {
        const subject = await Subject.findByPk(updateData.sbj_id);
        if (!subject) {
          return res.status(404).json({
            success: false,
            message: 'Subject not found'
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

      await entry.update(updateData);

      const updated = await TimetableEntry.findByPk(id, {
        include: [
          { model: Timetable },
          { model: Class },
          { model: Subject },
          { model: Employee, as: 'teacher' }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Timetable entry updated successfully',
        data: updated
      });
    } catch (error) {
      console.error('Error updating timetable entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async deleteEntry(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid entry ID'
        });
      }

      const entry = await TimetableEntry.findByPk(id);
      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Timetable entry not found'
        });
      }

      await entry.destroy();

      return res.status(200).json({
        success: true,
        message: 'Timetable entry deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting timetable entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = timetableEntryController;

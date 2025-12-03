const { Timetable, TimetableEntry } = require('../../model');
const timetableValidator = require('../../validators/timetableValidator');

const timetableController = {
  async createTimetable(req, res) {
    try {
      const data = req.body;
      
      const validation = timetableValidator.validateTimetableData(data);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const timetable = await Timetable.create(data);

      return res.status(201).json({
        success: true,
        message: 'Timetable created successfully',
        data: timetable
      });
    } catch (error) {
      console.error('Error creating timetable:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getAllTimetables(req, res) {
    try {
      const timetables = await Timetable.findAll({
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: timetables
      });
    } catch (error) {
      console.error('Error fetching timetables:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getTimetableById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid timetable ID'
        });
      }

      const timetable = await Timetable.findByPk(id, {
        include: [{ model: TimetableEntry }]
      });

      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: 'Timetable not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: timetable
      });
    } catch (error) {
      console.error('Error fetching timetable:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async updateTimetable(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid timetable ID'
        });
      }

      const timetable = await Timetable.findByPk(id);
      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: 'Timetable not found'
        });
      }

      const validation = timetableValidator.validateTimetableData(updateData, true);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      await timetable.update(updateData);

      return res.status(200).json({
        success: true,
        message: 'Timetable updated successfully',
        data: timetable
      });
    } catch (error) {
      console.error('Error updating timetable:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async deleteTimetable(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid timetable ID'
        });
      }

      const timetable = await Timetable.findByPk(id);
      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: 'Timetable not found'
        });
      }

      await timetable.destroy();

      return res.status(200).json({
        success: true,
        message: 'Timetable deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting timetable:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async setActiveTimetable(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid timetable ID'
        });
      }

      const timetable = await Timetable.findByPk(id);
      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: 'Timetable not found'
        });
      }

      await Timetable.update({ is_active: false }, { where: {} });
      await timetable.update({ is_active: true });

      return res.status(200).json({
        success: true,
        message: 'Timetable set as active',
        data: timetable
      });
    } catch (error) {
      console.error('Error setting active timetable:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getActiveTimetable(req, res) {
    try {
      const timetable = await Timetable.findOne({
        where: { is_active: true },
        include: [{ model: TimetableEntry }]
      });

      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: 'No active timetable found'
        });
      }

      return res.status(200).json({
        success: true,
        data: timetable
      });
    } catch (error) {
      console.error('Error fetching active timetable:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = timetableController;

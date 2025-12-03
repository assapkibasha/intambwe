const { SpecialEvent, Class, Employee } = require('../../model');
const { Op } = require('sequelize');
const specialEventValidator = require('../../validators/specialEventValidator');

const specialEventController = {
  async createEvent(req, res) {
    try {
      const data = req.body;
      
      const validation = specialEventValidator.validateEventData(data);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
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

      if (data.teacher_id) {
        const teacher = await Employee.findByPk(data.teacher_id);
        if (!teacher) {
          return res.status(404).json({
            success: false,
            message: 'Employee not found'
          });
        }
      }

      const event = await SpecialEvent.create(data);

      return res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
      });
    } catch (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getEvents(req, res) {
    try {
      const { class_id, teacher_id, start_date, end_date } = req.query;

      const whereClause = {};
      if (class_id) whereClause.class_id = class_id;
      if (teacher_id) whereClause.teacher_id = teacher_id;

      if (start_date || end_date) {
        whereClause.event_date = {};
        if (start_date) whereClause.event_date[Op.gte] = start_date;
        if (end_date) whereClause.event_date[Op.lte] = end_date;
      }

      const events = await SpecialEvent.findAll({
        where: whereClause,
        include: [
          { model: Class },
          { model: Employee, as: 'teacher' }
        ],
        order: [['event_date', 'ASC'], ['start_time', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getEventById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID'
        });
      }

      const event = await SpecialEvent.findByPk(id, {
        include: [
          { model: Class },
          { model: Employee, as: 'teacher' }
        ]
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID'
        });
      }

      const event = await SpecialEvent.findByPk(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      const validation = specialEventValidator.validateEventData(updateData, true);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
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

      await event.update(updateData);

      const updated = await SpecialEvent.findByPk(id, {
        include: [
          { model: Class },
          { model: Employee, as: 'teacher' }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: updated
      });
    } catch (error) {
      console.error('Error updating event:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async deleteEvent(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID'
        });
      }

      const event = await SpecialEvent.findByPk(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      await event.destroy();

      return res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = specialEventController;

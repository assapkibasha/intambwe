// controllers/inventoryLocationController.js
const { InventoryLocation, ItemLocation, InventoryItem } = require('../model');
const { Op } = require('sequelize');

const inventoryLocationController = {
  // Create location
  async createLocation(req, res) {
    try {
      const data = req.body;
      const location = await InventoryLocation.create(data);
      return res.status(201).json({ success: true, data: location });
    } catch (error) {
      console.error('Error creating location', error);
      return res.status(500).json({ success: false, message: 'Failed to create location', error: error.message });
    }
  },

  // List locations
  async listLocations(req, res) {
    try {
      const { page = 1, limit = 50, q, location_type, status } = req.query;
      const offset = (page - 1) * limit;
      const where = {};

      if (q) where.name = { [Op.like]: `%${q}%` };
      if (location_type) where.location_type = location_type;
      if (status) where.status = status;

      const { count, rows } = await InventoryLocation.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['location_id','DESC']]
      });

      return res.status(200).json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      console.error('Error listing locations', error);
      return res.status(500).json({ success: false, message: 'Failed to list locations', error: error.message });
    }
  },

  // Get location
  async getLocation(req, res) {
    try {
      const { id } = req.params;
      const location = await InventoryLocation.findByPk(id);
      if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
      return res.status(200).json({ success: true, data: location });
    } catch (error) {
      console.error('Error fetching location', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch location', error: error.message });
    }
  },

  // Update location
  async updateLocation(req, res) {
    try {
      const { id } = req.params;
      const location = await InventoryLocation.findByPk(id);
      if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

      await location.update(req.body);
      return res.status(200).json({ success: true, data: location });
    } catch (error) {
      console.error('Error updating location', error);
      return res.status(500).json({ success: false, message: 'Failed to update location', error: error.message });
    }
  },

  // Delete location
  async deleteLocation(req, res) {
    try {
      const { id } = req.params;
      const location = await InventoryLocation.findByPk(id);
      if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

      await location.destroy();
      return res.status(200).json({ success: true, message: 'Location deleted successfully' });
    } catch (error) {
      console.error('Error deleting location', error);
      return res.status(500).json({ success: false, message: 'Failed to delete location', error: error.message });
    }
  },

  // Add item to location
  async addItemToLocation(req, res) {
    try {
      const { item_id, location_id, quantity_in_location, bin_code } = req.body;
      if (!item_id || !location_id || quantity_in_location === undefined) {
        return res.status(400).json({ success: false, message: 'item_id, location_id, and quantity_in_location are required' });
      }

      // Check if mapping exists
      let itemLocation = await ItemLocation.findOne({
        where: { item_id, location_id }
      });

      if (itemLocation) {
        itemLocation.quantity_in_location = quantity_in_location;
        if (bin_code) itemLocation.bin_code = bin_code;
        await itemLocation.save();
      } else {
        itemLocation = await ItemLocation.create({
          item_id,
          location_id,
          quantity_in_location,
          bin_code: bin_code || null
        });
      }

      return res.status(201).json({ success: true, data: itemLocation });
    } catch (error) {
      console.error('Error adding item to location', error);
      return res.status(500).json({ success: false, message: 'Failed to add item to location', error: error.message });
    }
  },

  // Remove item from location
  async removeItemFromLocation(req, res) {
    try {
      const { item_location_id } = req.params;
      const itemLocation = await ItemLocation.findByPk(item_location_id);
      if (!itemLocation) return res.status(404).json({ success: false, message: 'Item location mapping not found' });

      await itemLocation.destroy();
      return res.status(200).json({ success: true, message: 'Item removed from location' });
    } catch (error) {
      console.error('Error removing item from location', error);
      return res.status(500).json({ success: false, message: 'Failed to remove item from location', error: error.message });
    }
  }
};

module.exports = inventoryLocationController;

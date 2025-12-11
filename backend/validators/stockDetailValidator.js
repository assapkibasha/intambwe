// validators/stockDetailValidator.js
const { isValidInteger, isValidDate } = require('./stockInValidator'); // Reuse helpers

const stockDetailValidator = {

    validateStockDetail(data) {
        const errors = [];
        
        // item_id validation
        if (!data.item_id || !isValidInteger(data.item_id)) {
            errors.push('Item ID is required and must be a positive integer.');
        }

        // quantity_received validation
        if (!data.quantity_received || !isValidInteger(data.quantity_received)) {
            errors.push('Quantity received is required and must be a positive integer.');
        } else if (data.quantity_received < 1) {
             errors.push('Quantity received must be at least 1.');
        }

        // unit_cost validation (optional, but must be numeric if provided)
        if (data.unit_cost !== undefined) {
            if (isNaN(data.unit_cost) || data.unit_cost < 0) {
                errors.push('Unit cost must be a non-negative number.');
            }
        }

        // expiry_date validation (optional, but must be a valid date if provided)
        if (data.expiry_date && !isValidDate(data.expiry_date)) {
            errors.push('Invalid expiry date format.');
        }

        // location validation (optional, max length)
        if (data.location && data.location.length > 100) {
            errors.push('Location must not exceed 100 characters.');
        }

        return errors;
    },

    validateStockDetails(itemsData) {
        const globalErrors = [];
        
        if (!Array.isArray(itemsData) || itemsData.length === 0) {
            return { isValid: false, errors: ['Request body must contain an array of items.'] };
        }

        itemsData.forEach((item, index) => {
            const itemErrors = stockDetailValidator.validateStockDetail(item);
            if (itemErrors.length > 0) {
                globalErrors.push({ itemIndex: index, errors: itemErrors });
            }
        });

        return { isValid: globalErrors.length === 0, errors: globalErrors };
    }
};

module.exports = stockDetailValidator;
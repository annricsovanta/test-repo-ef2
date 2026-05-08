const cds = require('@sap/cds');

module.exports = cds.service.impl(async function (srv) {
    const validateItem = (req) => {
        const { name, quantity, unit, category } = req.data;
        if (!name || !name.trim()) {
            req.error(400, 'Field "name" is required and must not be empty.');
        }
        if (quantity === null || quantity === undefined) {
            req.error(400, 'Field "quantity" is required.');
        }
        if (!unit || !unit.trim()) {
            req.error(400, 'Field "unit" is required and must not be empty.');
        }
        if (!category || !category.trim()) {
            req.error(400, 'Field "category" is required and must not be empty.');
        }
    };

    srv.before(['CREATE', 'UPDATE'], 'ShoppingItems', validateItem);
});

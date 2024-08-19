const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();


app.use(cors());
app.use(express.json());

app.get('/api/reservation', (req, res) => {
    const assignments = JSON.parse(fs.readFileSync(path.join(__dirname, 'product_assignment.json')));
    const charges = JSON.parse(fs.readFileSync(path.join(__dirname, 'product_charges.json')));

    const reservationsMap = new Map();

    assignments.forEach(assignment => {
        const uuid = assignment.reservation_uuid;

        if (!reservationsMap.has(uuid)) {
            reservationsMap.set(uuid, {
                reservation_uuid: uuid,
                numActivePurchases: 0,
                sumActiveCharges: 0,
                products: new Map() // Use a Map to track products and their charges
            });
        }

        const reservation = reservationsMap.get(uuid);
        const matchingCharges = charges.filter(charge => charge.special_product_assignment_id === assignment.id);

        // Aggregate charges for this product
        matchingCharges.forEach(charge => {
            const productName = assignment.name || 'Unknown Product';
            const product = reservation.products.get(productName) || { active: false, cancelled: false, amount: 0 };

            if (charge.active) {
                product.active = true;
                reservation.numActivePurchases += 1;
                reservation.sumActiveCharges += charge.amount || 0;
            } else {
                product.cancelled = true;
            }

            product.amount += charge.amount || 0;
            reservation.products.set(productName, product);
        });
    });


    const formattedReservations = Array.from(reservationsMap.values()).map(reservation => ({
        ...reservation,
        products: Array.from(reservation.products.entries()).map(([productName, product]) => ({
            product_name: productName,
            status: product.active ? 'active' : (product.cancelled ? 'cancelled' : 'not found'),
            amount: product.amount
        }))
    }));

    res.json(formattedReservations);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));








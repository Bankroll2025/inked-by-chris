require('dotenv').config();
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
    try {
        const { bookingId, amount } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                bookingId: bookingId
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (e) {
        console.error("Error creating payment intent:", e);
        res.status(500).json({ error: e.message });
    }
});

router.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            const bookingId = paymentIntent.metadata.bookingId;
            
            // Update booking status in your database
            try {
                // TODO: Update booking status to indicate deposit paid
                console.log('Payment succeeded for booking:', bookingId);
            } catch (err) {
                console.error('Error updating booking:', err);
            }
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed for booking:', failedPayment.metadata.bookingId);
            break;
    }

    res.json({ received: true });
});

module.exports = router;

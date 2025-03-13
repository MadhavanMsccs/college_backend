import express from 'express';
import Stripe from 'stripe';
import Fee from '../models/Fee.js';
import dotenv from 'dotenv';
dotenv.config();




console.log('Stripe Key from ENV:', process.env.STRIPE_SECRET_KEY); 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

console.log('Stripe Key Loaded:', !!process.env.STRIPE_SECRET_KEY); // Just for debugging

console.log('Stripe Key from ENV:', process.env.STRIPE_SECRET_KEY);
console.log('Stripe Key Loaded:', !!process.env.STRIPE_SECRET_KEY); 

router.post("/pay", async (req, res) => {
    console.log("📩 Received Payment Request:", req.body);

    const { studentId, name, amount, paymentMethodId } = req.body;

    if (!studentId || !name || !amount || !paymentMethodId) {
        console.error("❌ Missing Fields:", { studentId, name, amount, paymentMethodId });
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    console.log("✅ Payment data valid:", { studentId, name, amount, paymentMethodId });

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            payment_method: paymentMethodId,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never", // ✅ Prevents redirect-based payments
            },
        });

        res.json({ success: true, message: "Payment successful", paymentIntent });
    } catch (error) {
        console.error("❌ Payment failed:", error);
        res.status(500).json({ success: false, message: "Payment failed", error: error.message });
    }
});





// 🔹 Step 1: Create Payment Intent (Frontend Requests This)
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { studentId, name, amount } = req.body;

        if (!studentId || !name || !amount) {
                    console.error("❌ Missing Fields:", { studentId, name, amount, paymentMethodId });
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        console.log("Creating Payment Intent for:", studentId, "Amount:", amount);

        const amountInCents = parseInt(amount);
        if (isNaN(amountInCents) || amountInCents <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        // Check if student exists
        const feeRecord = await Fee.findOne({ studentId });
        if (!feeRecord) {
            return res.status(404).json({ success: false, message: "Fee record not found" });
        }

        if (feeRecord.status === 'Paid') {
            return res.status(400).json({ success: false, message: "Fee already paid" });
        }

        // 🔹 Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'inr',
            automatic_payment_methods: { enabled: true }, // Allow multiple payment methods
        });

        console.log("Payment Intent Created:", paymentIntent.id);

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });

    } catch (error) {
        console.error("Error Creating Payment Intent:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
    
    console.log("Received Payment Request:", req.body);

});

// 🔹 Step 2: Confirm Payment (Webhook or After Successful Payment)
router.post('/confirm-payment', async (req, res) => {
    try {
        const { paymentIntentId, studentId } = req.body;

        if (!paymentIntentId || !studentId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Retrieve Payment Intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        console.log("Confirming Payment Intent:", paymentIntent.id, "Status:", paymentIntent.status);

        if (paymentIntent.status === 'succeeded') {
            // Update Fee Record
            await Fee.updateOne({ studentId }, { status: 'Paid' });

            return res.status(200).json({
                success: true,
                message: "Payment successful",
                paymentIntentId: paymentIntent.id,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Payment not successful",
                status: paymentIntent.status,
            });
        }
    } catch (error) {
        console.error("Error Confirming Payment:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
});

export { router };

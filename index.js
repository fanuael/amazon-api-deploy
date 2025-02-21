const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Debugging: Check if the Stripe key is loaded
if (!process.env.STRIPE_KEY) {
    console.error("❌ Stripe Key is missing! Check your .env file.");
    process.exit(1);
} else {
    console.log("✅ Stripe Key loaded successfully.");
}

// Test Route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Success! Server is running." });
});

// Payment Route
app.post("/payments/create", async (req, res) => {
    try {
        const { total } = req.query;

        if (!total || isNaN(total)) {
            return res.status(400).json({ error: "Invalid total amount" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(total, 10),
            currency: "usd",
        });

        res.status(201).json({ clientSecret: paymentIntent.client_secret });

    } catch (error) {
        console.error("❌ Payment creation error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Export Firebase Function
exports.api = onRequest(app);

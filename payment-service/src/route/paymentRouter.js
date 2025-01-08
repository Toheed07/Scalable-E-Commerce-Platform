const express = require("express");
const Payment = require("../model/payment");
const dotenv = require("dotenv");

dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Payment Processing
router.post("/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { amount, paymentMethodId } = req.body;

  try {
    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "INR",
      payment_method: paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
    });

    const newPayment = new Payment({
      orderId,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      paymentMethod: paymentIntent.payment_method,
    });

    await newPayment.save();

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      payment: newPayment,
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(400).json({
      message: error.message,
      type: error.type,
    });
  }
});

// Get payment by ID
router.get("/:paymentId", async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ msg: "Payment not found" });

    res.json(payment);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Get payments for an order
router.get("/order/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const payments = await Payment.find({ orderId });
    res.json(payments);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;

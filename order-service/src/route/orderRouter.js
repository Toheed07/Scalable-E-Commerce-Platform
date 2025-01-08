const express = require("express");
const Order = require("../model/order");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

const PRODUCT_SERVICE_URI =
  process.env.PRODUCT_SERVICE_URI || "http://localhost:4001";

// Place a new order
router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { items, totalAmount } = req.body;

  try {
    // Check if all products are available
    const productChecks = await Promise.all(
      items.map(async (item) => {
        const product = await axios.get(
          `${PRODUCT_SERVICE_URI}/v1/api/products/${item.productId}`
        );
        return product.data && product.data.stock >= item.quantity;
      })
    );

    if (productChecks.includes(false)) {
      return res
        .status(400)
        .json({ msg: "One or more items are out of stock" });
    }

    // Create a new order
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
    });
    await newOrder.save();

    // Update stock in product service
    await Promise.all(
      items.map(async (item) => {
        await axios.put(
          `${PRODUCT_SERVICE_URI}/v1/api/products/${item.productId}/deduct`,
          { stock: item.quantity }
        );
      })
    );
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Error placing order" });
  }
});

// Get all orders for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId }).exec();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Get order by ID
router.get("/:userId/:orderId", async (req, res) => {
  const { userId, orderId } = req.params;
  try {
    const order = await Order.findById({ userId, _id: orderId }).exec();
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order" });
  }
});

// Update order status
router.put("/:orderId/status", async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    order.status = status;
    await order.save();
    res.status(200).json({ message: "Order updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating order" });
  }
});

module.exports = router;

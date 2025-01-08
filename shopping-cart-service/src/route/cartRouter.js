const express = require("express");
const Cart = require("../model/cart");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

const PRODUCT_SERVICE_URI =
  process.env.PRODUCT_SERVICE_URI || "http://localhost:4001";

// Add Item to Cart
router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    const product = await axios.get(
      `${PRODUCT_SERVICE_URI}/v1/api/products/${productId}`
    );
    if (!product.data) {
      return res.status(404).json({ message: "Product not found" });
    }

    const cart = await Cart.findOne({ userId });

    if (cart) {
      const product = cart.items.find(
        (product) => product.productId === productId
      );
      if (product) {
        product.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      await cart.save();
      res.status(200).json(cart);
    } else {
      const newCart = new Cart({
        userId,
        items: [{ productId, quantity }],
      });
      await newCart.save();
      res.status(201).json(newCart);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Cart
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove Item from Cart
router.delete("/:userId/remove/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.items = cart.items.filter(
      (product) => product.productId !== productId
    );
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Item Quantity
router.put("/:userId/update/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const product = cart.items.find(
      (product) => product.productId === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    product.quantity = quantity;
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

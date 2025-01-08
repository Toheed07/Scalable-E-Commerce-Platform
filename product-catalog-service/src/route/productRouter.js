const express = require("express");
const Product = require("../../src/model/product");

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, price, description, category, stock } = req.body;

  if (!name || !price || !description || !category || !stock) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const duplicate = await Product.findOne({ name })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ message: "Product with same name already exists" });
    }
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      stock,
    });

    const product = await newProduct.save();

    res.status(201).json({ message: `Product ${name} added successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error adding product" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id).exec();

    if (!product) return res.status(404).json({ msg: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { name, price, description, category, stock } = req.body;
  try {
    const product = await Product.findByIdAndUpdate(id, {
      name,
      description,
      price,
      category,
      stock,
    });
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
});

router.put("/:id/deduct", async (req, res) => {
  const id = req.params.id;
  const { stock } = req.body;
  try {
    const product = await Product
      .findById(id)
      .exec();
    if (!product) return res.status(404).json({ msg: "Product not found" });
    if (product.stock < stock) {
      return res.status(400).json({ message: "Not enough stock" });
    }
    product.stock -= stock;
    await product.save();
    res.status(200).json({ message: "Stock deducted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deducting stock" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

module.exports = router;

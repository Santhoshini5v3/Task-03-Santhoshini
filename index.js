const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────
// CREATE - Add a new product
// POST /api/products
// ─────────────────────────────────────────
app.post('/api/products', (req, res) => {
  const { name, price, quantity } = req.body;

  if (!name || price === undefined || quantity === undefined) {
    return res.status(400).json({ error: 'name, price, and quantity are required' });
  }

  const sql = 'INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)';
  db.run(sql, [name, price, quantity], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      message: 'Product created successfully!',
      product: { id: this.lastID, name, price, quantity }
    });
  });
});

// ─────────────────────────────────────────
// READ ALL - Get all products
// GET /api/products
// ─────────────────────────────────────────
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'All products fetched!', count: rows.length, products: rows });
  });
});

// ─────────────────────────────────────────
// READ ONE - Get a single product by ID
// GET /api/products/:id
// ─────────────────────────────────────────
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product fetched!', product: row });
  });
});

// ─────────────────────────────────────────
// UPDATE - Edit a product by ID
// PUT /api/products/:id
// ─────────────────────────────────────────
app.put('/api/products/:id', (req, res) => {
  const { name, price, quantity } = req.body;

  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const updatedName     = name     ?? existing.name;
    const updatedPrice    = price    ?? existing.price;
    const updatedQuantity = quantity ?? existing.quantity;

    db.run(
      'UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?',
      [updatedName, updatedPrice, updatedQuantity, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          message: 'Product updated successfully!',
          product: { id: Number(req.params.id), name: updatedName, price: updatedPrice, quantity: updatedQuantity }
        });
      }
    );
  });
});

// ─────────────────────────────────────────
// DELETE - Remove a product by ID
// DELETE /api/products/:id
// ─────────────────────────────────────────
app.delete('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: `Product "${existing.name}" deleted successfully!` });
    });
  });
});

// ─────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('');
  console.log('Available Routes:');
  console.log('  POST   /api/products       → Create product');
  console.log('  GET    /api/products       → Get all products');
  console.log('  GET    /api/products/:id   → Get one product');
  console.log('  PUT    /api/products/:id   → Update product');
  console.log('  DELETE /api/products/:id   → Delete product');
});
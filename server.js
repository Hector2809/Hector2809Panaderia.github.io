const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'n0m3l0',
    database: 'panaderia_desesperanza'
});

db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

app.post('/api/products', (req, res) => {
    const { name, price, quantity } = req.body;
    const sql = 'INSERT INTO Productos (nombre, precio) VALUES (?, ?)';
    db.query(sql, [name, price], (err, result) => {
        if (err) {
            console.error('Error al insertar producto:', err);
            return res.status(500).json({ error: 'Error al crear producto' });
        }
        const productId = result.insertId;
        db.query('INSERT INTO Inventario (producto_id, cantidad) VALUES (?, ?)', [productId, quantity], err => {
            if (err) {
                console.error('Error al insertar en inventario:', err);
                return res.status(500).json({ error: 'Error al agregar al inventario' });
            }
            res.status(201).json({ message: 'Producto creado exitosamente', productId });
        });
    });
});

app.get('/api/inventory', (req, res) => {
    const sql = `SELECT p.id, p.nombre, p.precio, i.cantidad 
                 FROM Productos p 
                 JOIN Inventario i ON p.id = i.producto_id`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener inventario:', err);
            res.status(500).json({ error: 'Error al obtener inventario' });
            return;
        }
        res.status(200).json(results);
    });
});

app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, quantity } = req.body;

    db.query('UPDATE Productos SET nombre = ?, precio = ? WHERE id = ?', [name, price, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar producto:', err);
            res.status(500).json({ error: 'Error al actualizar producto' });
            return;
        }

        db.query('UPDATE Inventario SET cantidad = ? WHERE producto_id = ?', [quantity, id], err => {
            if (err) {
                console.error('Error al actualizar inventario:', err);
                res.status(500).json({ error: 'Error al actualizar inventario' });
                return;
            }
            res.status(200).json({ message: 'Producto actualizado exitosamente' });
        });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM Inventario WHERE producto_id = ?', [id], err => {
        if (err) {
            console.error('Error al eliminar del inventario:', err);
            res.status(500).json({ error: 'Error al eliminar del inventario' });
            return;
        }
        
        db.query('DELETE FROM Productos WHERE id = ?', [id], err => {
            if (err) {
                console.error('Error al eliminar producto:', err);
                res.status(500).json({ error: 'Error al eliminar producto' });
                return;
            }
            res.status(200).json({ message: 'Producto eliminado exitosamente' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:3000`);
});
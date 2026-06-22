const http = require('http');
const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'StrongPass_2026!',
    server: '127.0.0.1',
    port: 1433,
    database: 'testdb',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool = null;

async function connectDB() {
    try {
        pool = await sql.connect(config);
        console.log('Connected to SQL Server');
        
        // Создаем таблицу если её нет
        await pool.request().query(`
            IF OBJECT_ID('products', 'U') IS NULL
            BEGIN
                CREATE TABLE products (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name VARCHAR(100),
                    price DECIMAL(10, 2),
                    stock INT
                );
                
                INSERT INTO products (name, price, stock) VALUES
                ('Laptop', 999.99, 10),
                ('Mouse', 29.99, 50),
                ('Keyboard', 59.99, 30);
            END
        `);
        console.log('Table products ready');
        return true;
    } catch (error) {
        console.error('Connection error:', error.message);
        return false;
    }
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'PUT' && /^\/products\/\d+$/.test(url.pathname)) {
        const id = parseInt(url.pathname.split('/')[2]);
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const updates = JSON.parse(body);
                const fields = [];
                const values = [];
                let paramIndex = 1;

                if (updates.name !== undefined) {
                    fields.push(`name = @p${paramIndex}`);
                    values.push({ name: `p${paramIndex}`, value: updates.name });
                    paramIndex++;
                }
                if (updates.price !== undefined) {
                    fields.push(`price = @p${paramIndex}`);
                    values.push({ name: `p${paramIndex}`, value: updates.price });
                    paramIndex++;
                }
                if (updates.stock !== undefined) {
                    fields.push(`stock = @p${paramIndex}`);
                    values.push({ name: `p${paramIndex}`, value: updates.stock });
                    paramIndex++;
                }

                if (fields.length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No fields to update' }));
                    return;
                }

                let request = pool.request();
                values.forEach(v => {
                    request = request.input(v.name, v.value);
                });
                request = request.input('id', sql.Int, id);

                // Без updated_at
                const query = `UPDATE products SET ${fields.join(', ')} OUTPUT INSERTED.* WHERE id = @id`;
                const result = await request.query(query);

                if (result.recordset.length === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Product not found' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result.recordset[0]));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    else if (req.method === 'GET' && url.pathname === '/products') {
        (async () => {
            try {
                const result = await pool.request().query('SELECT * FROM products ORDER BY id');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.recordset));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        })();
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SQL UPDATE Demo</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    .product { border: 1px solid #ccc; margin: 10px; padding: 10px; }
                    input { margin: 5px; padding: 5px; }
                </style>
            </head>
            <body>
                <h1>Update Product (PUT/UPDATE)</h1>
                <div id="products"></div>
                <script>
                    function loadProducts() {
                        fetch('/products')
                            .then(res => res.json())
                            .then(data => {
                                const container = document.getElementById('products');
                                if (data.length === 0) {
                                    container.innerHTML = '<p>No products.</p>';
                                    return;
                                }
                                container.innerHTML = '<h2>Products:</h2>';
                                data.forEach(p => {
                                    container.innerHTML += \`
                                        <div class="product">
                                            <strong>\${p.name}</strong> - $\${p.price} - Stock: \${p.stock}
                                            <br>
                                            <input type="text" id="name_\${p.id}" placeholder="New name" value="\${p.name}">
                                            <input type="number" id="price_\${p.id}" placeholder="New price" value="\${p.price}">
                                            <input type="number" id="stock_\${p.id}" placeholder="New stock" value="\${p.stock}">
                                            <button onclick="updateProduct(\${p.id})">Update</button>
                                        </div>
                                    \`;
                                });
                            });
                    }
                    
                    function updateProduct(id) {
                        const name = document.getElementById(\`name_\${id}\`).value;
                        const price = parseFloat(document.getElementById(\`price_\${id}\`).value);
                        const stock = parseInt(document.getElementById(\`stock_\${id}\`).value);
                        
                        fetch(\`/products/\${id}\`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, price, stock })
                        })
                        .then(res => res.json())
                        .then(data => {
                            loadProducts();
                        });
                    }
                    
                    loadProducts();
                </script>
            </body>
            </html>
        `);
    }
});

connectDB().then(success => {
    if (success) {
        server.listen(3000, () => {
            console.log('Server on http://localhost:3000');
            console.log('PUT /products/1 - update product');
        });
    }
});
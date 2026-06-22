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

    if (req.method === 'POST' && url.pathname === '/products') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { name, price, stock } = JSON.parse(body);
                
                if (!name || price === undefined || stock === undefined) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Fields required: name, price, stock' }));
                    return;
                }

                const result = await pool.request()
                    .input('name', sql.VarChar, name)
                    .input('price', sql.Decimal(10, 2), price)
                    .input('stock', sql.Int, stock)
                    .query(`
                        INSERT INTO products (name, price, stock) 
                        OUTPUT INSERTED.* 
                        VALUES (@name, @price, @stock)
                    `);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.recordset[0]));
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
                <title>SQL INSERT Demo</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    input, button { margin: 5px; padding: 5px; }
                </style>
            </head>
            <body>
                <h1>Add Product (POST/INSERT)</h1>
                <div>
                    <input type="text" id="name" placeholder="Product name">
                    <input type="number" id="price" placeholder="Price">
                    <input type="number" id="stock" placeholder="Stock">
                    <button onclick="addProduct()">Add Product</button>
                </div>
                <div id="products">
                    <h2>Products:</h2>
                    <div id="productList"></div>
                </div>
                <script>
                    function loadProducts() {
                        fetch('/products')
                            .then(res => res.json())
                            .then(data => {
                                document.getElementById('productList').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                            });
                    }
                    
                    function addProduct() {
                        const name = document.getElementById('name').value;
                        const price = parseFloat(document.getElementById('price').value);
                        const stock = parseInt(document.getElementById('stock').value);
                        
                        fetch('/products', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, price, stock })
                        })
                        .then(res => res.json())
                        .then(data => {
                            loadProducts();
                            document.getElementById('name').value = '';
                            document.getElementById('price').value = '';
                            document.getElementById('stock').value = '';
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
            console.log('POST /products - add product');
        });
    }
});
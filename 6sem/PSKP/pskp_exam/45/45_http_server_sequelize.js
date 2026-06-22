const http = require('http');
const { Sequelize, DataTypes } = require('sequelize');

// Подключение к SQL Server через Sequelize
const sequelize = new Sequelize('testdb', 'sa', 'StrongPass_2026!', {
    host: '127.0.0.1',
    port: 1433,
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: false,
            trustServerCertificate: true
        }
    }
    // ,
    // logging: false 
});

// Определение модели
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(50),
        defaultValue: 'General'
    },
    inStock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'products_sequelize',
    timestamps: true
});

async function initDB() {
    try {
        await sequelize.authenticate();
        console.log('Connected to SQL Server');
        await sequelize.sync({ force: true });
        console.log('Table synced');
        
        await Product.bulkCreate([
            { name: 'Laptop', price: 999.99, category: 'Electronics' },
            { name: 'Mouse', price: 29.99, category: 'Electronics' },
            { name: 'Desk', price: 199.99, category: 'Furniture' }
        ]);
        console.log('Test data added');
        return true;
    } catch (error) {
        console.error('DB error:', error.message);
        return false;
    }
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/products') {
        (async () => {
            try {
                const products = await Product.findAll();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(products));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        })();
    }
    else if (req.method === 'GET' && /^\/products\/\d+$/.test(url.pathname)) {
        const id = parseInt(url.pathname.split('/')[2]);
        (async () => {
            try {
                const product = await Product.findByPk(id);
                if (!product) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Product not found' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(product));
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        })();
    }
    else if (req.method === 'POST' && url.pathname === '/products') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const product = await Product.create(data);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(product));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    else if (req.method === 'PUT' && /^\/products\/\d+$/.test(url.pathname)) {
        const id = parseInt(url.pathname.split('/')[2]);
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const updates = JSON.parse(body);
                const product = await Product.findByPk(id);
                if (!product) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Product not found' }));
                } else {
                    await product.update(updates);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(product));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    else if (req.method === 'DELETE' && /^\/products\/\d+$/.test(url.pathname)) {
        const id = parseInt(url.pathname.split('/')[2]);
        (async () => {
            try {
                const deleted = await Product.destroy({ where: { id } });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, deleted }));
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
                <title>Sequelize Demo</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    .product { border: 1px solid #ccc; margin: 5px; padding: 10px; }
                    input, button { margin: 5px; padding: 5px; }
                </style>
            </head>
            <body>
                <h1>Sequelize ORM Demo (SQL Server)</h1>
                <div>
                    <input type="text" id="name" placeholder="Name">
                    <input type="number" id="price" placeholder="Price">
                    <input type="text" id="category" placeholder="Category">
                    <button onclick="createProduct()">Create</button>
                </div>
                <div id="products"></div>
                <script>
                    function loadProducts() {
                        fetch('/products')
                            .then(res => res.json())
                            .then(data => {
                                const container = document.getElementById('products');
                                if (data.length) {
                                    container.innerHTML = data.map(p => \`
                                        <div class="product">
                                            <strong>\${p.name}</strong> - $\${p.price} - \${p.category}
                                            <button onclick="deleteProduct(\${p.id})">Delete</button>
                                        </div>
                                    \`).join('');
                                }
                            });
                    }
                    
                    function createProduct() {
                        const name = document.getElementById('name').value;
                        const price = parseFloat(document.getElementById('price').value);
                        const category = document.getElementById('category').value;
                        fetch('/products', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, price, category })
                        }).then(() => loadProducts());
                    }
                    
                    function deleteProduct(id) {
                        fetch(\`/products/\${id}\`, { method: 'DELETE' })
                            .then(() => loadProducts());
                    }
                    
                    loadProducts();
                </script>
            </body>
            </html>
        `);
    }
});

initDB().then(success => {
    if (success) {
        server.listen(3000, () => {
            console.log('Sequelize server on http://localhost:3000');
            console.log('GET /products - all products');
            console.log('POST /products - create product');
            console.log('PUT /products/1 - update product');
            console.log('DELETE /products/1 - delete product');
        });
    }
});
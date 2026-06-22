// http_server_mongodb.js
const http = require('http');
const { MongoClient } = require('mongodb'); // npm install mongodb

// Настройка подключения к MongoDB
const url = 'mongodb://localhost:27017';
const dbName = 'testdb';
let db;
let collection;

async function initMongoDB() {
    const client = new MongoClient(url);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    collection = db.collection('items');
    
    // Создание индекса
    await collection.createIndex({ name: 1 });
}

const server = http.createServer(async (req, res) => {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    
    // GET /items - получить все items
    if (req.method === 'GET' && urlObj.pathname === '/items') {
        const items = await collection.find({}).toArray();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: items }));
    }
    // GET /items/:id - получить item по ID
    else if (req.method === 'GET' && urlObj.pathname.match(/^\/items\/[a-fA-F0-9]+$/)) {
        const id = urlObj.pathname.split('/')[2];
        const { ObjectId } = require('mongodb');
        const item = await collection.findOne({ _id: new ObjectId(id) });
        if (!item) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Item not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: item }));
        }
    }
    // POST /items - создать item
    else if (req.method === 'POST' && req.url === '/items') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const result = await collection.insertOne({
                    ...data,
                    createdAt: new Date()
                });
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    id: result.insertedId,
                    data: { _id: result.insertedId, ...data }
                }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    // PUT /items/:id - обновить item
    else if (req.method === 'PUT' && urlObj.pathname.match(/^\/items\/[a-fA-F0-9]+$/)) {
        const id = urlObj.pathname.split('/')[2];
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const updates = JSON.parse(body);
                const { ObjectId } = require('mongodb');
                const result = await collection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { ...updates, updatedAt: new Date() } }
                );
                if (result.matchedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Item not found' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, modified: result.modifiedCount }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    // DELETE /items/:id - удалить item
    else if (req.method === 'DELETE' && urlObj.pathname.match(/^\/items\/[a-fA-F0-9]+$/)) {
        const id = urlObj.pathname.split('/')[2];
        const { ObjectId } = require('mongodb');
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Item not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, deleted: result.deletedCount }));
        }
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>MongoDB CRUD Demo</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    .item { border: 1px solid #ccc; margin: 5px; padding: 10px; }
                    input, button { margin: 5px; padding: 5px; }
                </style>
            </head>
            <body>
                <h1>MongoDB CRUD операции</h1>
                <div>
                    <input type="text" id="name" placeholder="Название">
                    <input type="number" id="value" placeholder="Значение">
                    <button onclick="createItem()">Создать</button>
                </div>
                <div id="items"></div>
                <script>
                    function loadItems() {
                        fetch('/items')
                            .then(res => res.json())
                            .then(data => {
                                const container = document.getElementById('items');
                                if (data.data && data.data.length) {
                                    container.innerHTML = data.data.map(item => \`
                                        <div class="item">
                                            <strong>\${item.name}</strong> - \${item.value}
                                            <button onclick="deleteItem('\${item._id}')">Удалить</button>
                                        </div>
                                    \`).join('');
                                } else {
                                    container.innerHTML = '<p>Нет данных</p>';
                                }
                            });
                    }
                    
                    function createItem() {
                        const name = document.getElementById('name').value;
                        const value = parseInt(document.getElementById('value').value);
                        fetch('/items', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, value })
                        }).then(() => {
                            loadItems();
                            document.getElementById('name').value = '';
                            document.getElementById('value').value = '';
                        });
                    }
                    
                    function deleteItem(id) {
                        fetch(\`/items/\${id}\`, { method: 'DELETE' })
                            .then(() => loadItems());
                    }
                    
                    loadItems();
                </script>
            </body>
            </html>
        `);
    }
});

initMongoDB().then(() => {
    server.listen(3000, () => {
        console.log('MongoDB сервер на http://localhost:3000');
        console.log('Доступные операции: GET, POST, PUT, DELETE');
    });
});
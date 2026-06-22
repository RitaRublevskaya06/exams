// Импорт модуля http для создания HTTP сервера
const http = require('http');
// Импорт модуля mongodb для работы с MongoDB
const { MongoClient } = require('mongodb');

// Настройка подключения к MongoDB
const url = 'mongodb://localhost:27017'; // URL MongoDB сервера
const dbName = 'testdb'; // Имя базы данных
let db; // Переменная для хранения объекта базы данных
let collection; // Переменная для хранения объекта коллекции

// Функция для инициализации подключения к MongoDB
async function initMongoDB() {
    // Создание нового клиента MongoDB
    const client = new MongoClient(url);
    // Подключение к MongoDB серверу
    await client.connect();
    console.log('Connected to MongoDB');
    // Получение объекта базы данных
    db = client.db(dbName);
    // Получение объекта коллекции (таблицы)
    collection = db.collection('items');
    
    // Создание индекса по полю name для оптимизации поиска
    await collection.createIndex({ name: 1 });
}

// Создание HTTP сервера
const server = http.createServer(async (req, res) => {
    // Парсинг URL для извлечения пути и параметров
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    
    // Обработка GET запроса для получения всех items
    if (req.method === 'GET' && urlObj.pathname === '/items') {
        // Получение всех документов из коллекции
        const items = await collection.find({}).toArray();
        // Установка заголовков для JSON ответа
        res.writeHead(200, { 'Content-Type': 'application/json' });
        // Отправка данных в формате JSON
        res.end(JSON.stringify({ success: true, data: items }));
    }
    // Обработка GET запроса для получения item по ID
    else if (req.method === 'GET' && urlObj.pathname.match(/^\/items\/[a-fA-F0-9]+$/)) {
        // Извлечение ID из URL
        const id = urlObj.pathname.split('/')[2];
        // Импорт ObjectId для работы с MongoDB ObjectId
        const { ObjectId } = require('mongodb');
        // Поиск документа по ID
        const item = await collection.findOne({ _id: new ObjectId(id) });
        if (!item) {
            // Документ не найден
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Item not found' }));
        } else {
            // Успешное получение документа
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: item }));
        }
    }
    // Обработка POST запроса для создания нового item
    else if (req.method === 'POST' && req.url === '/items') {
        let body = '';
        // Сбор данных тела запроса
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                // Парсинг JSON из тела запроса
                const data = JSON.parse(body);
                // Вставка нового документа в коллекцию
                const result = await collection.insertOne({
                    ...data, // Копирование всех полей из данных
                    createdAt: new Date() // Добавление временной метки
                });
                // Отправка успешного ответа с ID созданного документа
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    id: result.insertedId,
                    data: { _id: result.insertedId, ...data }
                }));
            } catch (error) {
                // Обработка ошибок парсинга или вставки
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    // Обработка PUT запроса для обновления item
    else if (req.method === 'PUT' && urlObj.pathname.match(/^\/items\/[a-fA-F0-9]+$/)) {
        const id = urlObj.pathname.split('/')[2];
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const updates = JSON.parse(body);
                const { ObjectId } = require('mongodb');
                // Обновление документа в коллекции
                const result = await collection.updateOne(
                    { _id: new ObjectId(id) }, // Условие поиска
                    { $set: { ...updates, updatedAt: new Date() } } // Операция обновления
                );
                if (result.matchedCount === 0) {
                    // Документ не найден
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Item not found' }));
                } else {
                    // Успешное обновление
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, modified: result.modifiedCount }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    // Обработка DELETE запроса для удаления item
    else if (req.method === 'DELETE' && urlObj.pathname.match(/^\/items\/[a-fA-F0-9]+$/)) {
        const id = urlObj.pathname.split('/')[2];
        const { ObjectId } = require('mongodb');
        // Удаление документа из коллекции
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            // Документ не найден
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Item not found' }));
        } else {
            // Успешное удаление
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, deleted: result.deletedCount }));
        }
    }
    // Обработка всех других запросов (главная страница)
    else {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        // Отправка HTML страницы с интерфейсом управления items
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
                    // Функция для загрузки всех items
                    function loadItems() {
                        fetch('/items')
                            .then(res => res.json())
                            .then(data => {
                                const container = document.getElementById('items');
                                if (data.data && data.data.length) {
                                    // Отображение всех items с кнопками удаления
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
                    
                    // Функция для создания нового item
                    function createItem() {
                        const name = document.getElementById('name').value;
                        const value = parseInt(document.getElementById('value').value);
                        fetch('/items', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, value })
                        }).then(() => {
                            // Обновление списка после создания
                            loadItems();
                            // Очистка полей формы
                            document.getElementById('name').value = '';
                            document.getElementById('value').value = '';
                        });
                    }
                    
                    // Функция для удаления item
                    function deleteItem(id) {
                        fetch(\`/items/\${id}\`, { method: 'DELETE' })
                            .then(() => loadItems());
                    }
                    
                    // Загрузка items при загрузке страницы
                    loadItems();
                </script>
            </body>
            </html>
        `);
    }
});

// Инициализация MongoDB и запуск сервера
initMongoDB().then(() => {
    server.listen(3000, () => {
        console.log('MongoDB сервер на http://localhost:3000');
        console.log('Доступные операции: GET, POST, PUT, DELETE');
    });
});
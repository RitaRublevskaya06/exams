// Импорт модуля http для создания HTTP сервера
const http = require('http');
// Импорт модуля graphql для работы с GraphQL
const { graphql, buildSchema } = require('graphql');

// Данные пользователей в памяти (для демонстрации)
let users = [
    { id: '1', name: 'Alice', email: 'alice@example.com', age: 25 },
    { id: '2', name: 'Bob', email: 'bob@example.com', age: 30 },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', age: 35 }
];

// Счетчик для генерации новых ID
let nextId = 4;

// Создание GraphQL схемы с использованием GraphQL Schema Language
const schema = buildSchema(`
    type User {
        id: ID! // Уникальный идентификатор (обязательное поле)
        name: String! // Имя пользователя (обязательное поле)
        email: String! // Email пользователя (обязательное поле)
        age: Int // Возраст пользователя (опциональное поле)
    }
    
    type Query {
        users: [User] // Получение списка пользователей
        user(id: ID!): User // Получение пользователя по ID
        usersByAge(minAge: Int!, maxAge: Int!): [User] // Получение пользователей по диапазону возраста
    }
    
    type Mutation {
        createUser(name: String!, email: String!, age: Int): User // Создание нового пользователя
        updateUser(id: ID!, name: String, email: String, age: Int): User // Обновление пользователя
        deleteUser(id: ID!): User // Удаление пользователя
    }
`);

// Определение resolvers (обработчиков) для схемы
const root = {
    // Resolver для получения всех пользователей
    users: () => users,
    // Resolver для получения пользователя по ID
    user: ({ id }) => users.find(u => u.id === id),
    // Resolver для получения пользователей по диапазону возраста
    usersByAge: ({ minAge, maxAge }) => users.filter(u => u.age >= minAge && u.age <= maxAge),
    // Resolver для создания нового пользователя
    createUser: ({ name, email, age }) => {
        const user = { id: String(nextId++), name, email, age };
        users.push(user);
        return user;
    },
    // Resolver для обновления пользователя
    updateUser: ({ id, name, email, age }) => {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null; // Пользователь не найден
        // Обновление только указанных полей
        users[index] = { ...users[index], ...(name && { name }), ...(email && { email }), ...(age && { age }) };
        return users[index];
    },
    // Resolver для удаления пользователя
    deleteUser: ({ id }) => {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null; // Пользователь не найден
        const deleted = users[index];
        users.splice(index, 1); // Удаление пользователя из массива
        return deleted;
    }
};

// Создание HTTP сервера
const server = http.createServer(async (req, res) => {
    // Обработка POST запросов к GraphQL эндпоинту
    if (req.method === 'POST' && req.url === '/graphql') {
        let body = '';
        // Сбор данных тела запроса
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                // Парсинг JSON из тела запроса
                const { query, variables } = JSON.parse(body);
                // Выполнение GraphQL запроса
                const result = await graphql({
                    schema, // Схема GraphQL
                    source: query, // GraphQL запрос
                    rootValue: root, // Resolvers
                    variableValues: variables // Переменные запроса
                });
                // Установка заголовков для JSON ответа
                res.writeHead(200, { 'Content-Type': 'application/json' });
                // Отправка результата выполнения GraphQL запроса
                res.end(JSON.stringify(result));
            } catch (error) {
                // Обработка ошибок парсинга или выполнения запроса
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    // Обработка GET запросов для отображения GraphQL playground
    else if (req.method === 'GET' && req.url === '/') {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        // Отправка HTML страницы с GraphQL playground
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>GraphQL Server</title>
                <style>
                    body { font-family: monospace; padding: 20px; }
                    .query-area { width: 100%; height: 200px; font-family: monospace; }
                    button { padding: 10px; margin: 10px 0; }
                    .result { border: 1px solid #ccc; padding: 10px; background: #f5f5f5; }
                </style>
            </head>
            <body>
                <h1>GraphQL Server Demo</h1>
                <textarea id="query" class="query-area" placeholder="GraphQL query...">
{
  users {
    id
    name
    email
    age
  }
}</textarea>
                <br>
                <button onclick="executeQuery()">Execute</button>
                <button onclick="setQuery('users')">Get Users</button>
                <button onclick="setQuery('create')">Create User</button>
                <button onclick="setQuery('update')">Update User</button>
                <button onclick="setQuery('delete')">Delete User</button>
                <div id="result" class="result">Result will appear here...</div>
                
                <script>
                    // Функция для выполнения GraphQL запроса
                    function executeQuery() {
                        const query = document.getElementById('query').value;
                        fetch('/graphql', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query })
                        })
                        .then(res => res.json())
                        .then(data => {
                            // Отображение результата запроса
                            document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                        });
                    }
                    
                    // Функция для установки предопределенных запросов
                    function setQuery(type) {
                        const queries = {
                            users: \`{
                                users {
                                    id, name, email, age
                                }
                            }\`,
                            create: \`mutation {
                                createUser(name: "New User", email: "new@example.com", age: 28) {
                                    id, name, email, age
                                }
                            }\`,
                            update: \`mutation {
                                updateUser(id: "1", name: "Updated Alice") {
                                    id, name, email, age
                                }
                            }\`,
                            delete: \`mutation {
                                deleteUser(id: "3") {
                                    id, name
                                }
                            }\`
                        };
                        document.getElementById('query').value = queries[type];
                    }
                    
                    // Автоматическое выполнение запроса при загрузке страницы
                    executeQuery();
                </script>
            </body>
            </html>
        `);
    }
    // Обработка всех других запросов
    else {
        res.writeHead(404);
        res.end();
    }
});

// Запуск сервера на порту 3000
server.listen(3000, () => {
    console.log('GraphQL сервер на http://localhost:3000');
    console.log('POST /graphql - GraphQL запросы');
});
// http_server_graphql.js
const http = require('http');
const { graphql, buildSchema } = require('graphql'); // npm install graphql

// Данные в памяти
let users = [
    { id: '1', name: 'Alice', email: 'alice@example.com', age: 25 },
    { id: '2', name: 'Bob', email: 'bob@example.com', age: 30 },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', age: 35 }
];

let nextId = 4;

// GraphQL схема
const schema = buildSchema(`
    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
    }
    
    type Query {
        users: [User]
        user(id: ID!): User
        usersByAge(minAge: Int!, maxAge: Int!): [User]
    }
    
    type Mutation {
        createUser(name: String!, email: String!, age: Int): User
        updateUser(id: ID!, name: String, email: String, age: Int): User
        deleteUser(id: ID!): User
    }
`);

// Resolvers
const root = {
    users: () => users,
    user: ({ id }) => users.find(u => u.id === id),
    usersByAge: ({ minAge, maxAge }) => users.filter(u => u.age >= minAge && u.age <= maxAge),
    createUser: ({ name, email, age }) => {
        const user = { id: String(nextId++), name, email, age };
        users.push(user);
        return user;
    },
    updateUser: ({ id, name, email, age }) => {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        users[index] = { ...users[index], ...(name && { name }), ...(email && { email }), ...(age && { age }) };
        return users[index];
    },
    deleteUser: ({ id }) => {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        const deleted = users[index];
        users.splice(index, 1);
        return deleted;
    }
};

const server = http.createServer(async (req, res) => {
    // GraphQL эндпоинт
    if (req.method === 'POST' && req.url === '/graphql') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { query, variables } = JSON.parse(body);
                const result = await graphql({
                    schema,
                    source: query,
                    rootValue: root,
                    variableValues: variables
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    // GraphQL playground
    else if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
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
                    function executeQuery() {
                        const query = document.getElementById('query').value;
                        fetch('/graphql', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query })
                        })
                        .then(res => res.json())
                        .then(data => {
                            document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                        });
                    }
                    
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
                    
                    executeQuery();
                </script>
            </body>
            </html>
        `);
    }
    else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(3000, () => {
    console.log('GraphQL сервер на http://localhost:3000');
    console.log('POST /graphql - GraphQL запросы');
});
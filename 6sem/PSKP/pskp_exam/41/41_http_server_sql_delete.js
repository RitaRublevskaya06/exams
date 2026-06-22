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
        return true;
    } catch (error) {
        console.error('Connection error:', error.message);
        return false;
    }
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'DELETE' && /^\/users\/\d+$/.test(url.pathname)) {
        const id = parseInt(url.pathname.split('/')[2]);
        (async () => {
            try {
                const result = await pool.request()
                    .input('id', sql.Int, id)
                    .query('DELETE FROM users OUTPUT DELETED.* WHERE id = @id');
                
                if (result.recordset.length === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result.recordset[0]));
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        })();
    }
    else if (req.method === 'DELETE' && url.pathname === '/users') {
        const confirm = url.searchParams.get('confirm');
        if (confirm !== 'true') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Use confirm=true to delete all users' }));
            return;
        }
        (async () => {
            try {
                const result = await pool.request().query('DELETE FROM users');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, deletedCount: result.rowsAffected[0] }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        })();
    }
    else if (req.method === 'POST' && url.pathname === '/users') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { name, email } = JSON.parse(body);
                const result = await pool.request()
                    .input('name', sql.VarChar, name)
                    .input('email', sql.VarChar, email)
                    .query('INSERT INTO users (name, email) OUTPUT INSERTED.* VALUES (@name, @email)');
                
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.recordset[0]));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    else if (req.method === 'GET' && url.pathname === '/users') {
        (async () => {
            try {
                const result = await pool.request().query('SELECT * FROM users ORDER BY id');
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
                <title>SQL DELETE Demo</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    .user { border: 1px solid #ccc; margin: 5px; padding: 10px; }
                    button.delete { background: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; }
                    button.delete-all { background: #ff9800; margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>Delete Users (DELETE)</h1>
                <div>
                    <input type="text" id="name" placeholder="Name">
                    <input type="email" id="email" placeholder="Email">
                    <button onclick="addUser()">Add</button>
                    <button onclick="deleteAll()" class="delete-all">Delete All</button>
                </div>
                <div id="users"></div>
                <script>
                    function loadUsers() {
                        fetch('/users')
                            .then(res => res.json())
                            .then(data => {
                                const container = document.getElementById('users');
                                if (data.length) {
                                    container.innerHTML = data.map(u => \`
                                        <div class="user">
                                            <strong>\${u.name}</strong> (\${u.email})
                                            <button class="delete" onclick="deleteUser(\${u.id})">Delete</button>
                                        </div>
                                    \`).join('');
                                } else {
                                    container.innerHTML = '<p>No users</p>';
                                }
                            });
                    }
                    
                    function addUser() {
                        const name = document.getElementById('name').value;
                        const email = document.getElementById('email').value;
                        fetch('/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, email })
                        }).then(() => {
                            loadUsers();
                            document.getElementById('name').value = '';
                            document.getElementById('email').value = '';
                        });
                    }
                    
                    function deleteUser(id) {
                        fetch(\`/users/\${id}\`, { method: 'DELETE' })
                            .then(() => loadUsers());
                    }
                    
                    function deleteAll() {
                        if (confirm('Delete all users?')) {
                            fetch('/users?confirm=true', { method: 'DELETE' })
                                .then(() => loadUsers());
                        }
                    }
                    
                    loadUsers();
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
            console.log('DELETE /users/1 - delete user');
            console.log('DELETE /users?confirm=true - delete all users');
        });
    }
});
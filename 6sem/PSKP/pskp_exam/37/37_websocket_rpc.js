// websocket_rpc.js
const WebSocket = require('ws');

class RPCServer {
    constructor(port) {
        this.wss = new WebSocket.Server({ port });
        this.methods = new Map();
        this.clients = new Map();
        this.setupDefaultMethods();
        this.setupHandlers();
    }
    
    setupDefaultMethods() {
        // Регистрация методов RPC
        this.registerMethod('add', (params) => {
            return { result: params.a + params.b };
        });
        
        this.registerMethod('multiply', (params) => {
            return { result: params.a * params.b };
        });
        
        this.registerMethod('getTime', () => {
            return { timestamp: new Date().toISOString(), unix: Date.now() };
        });
        
        this.registerMethod('echo', (params) => {
            return { echo: params };
        });
        
        this.registerMethod('getInfo', () => {
            return {
                name: 'RPC Server',
                version: '1.0.0',
                methods: Array.from(this.methods.keys())
            };
        });
    }
    
    registerMethod(name, handler) {
        this.methods.set(name, handler);
        console.log(`RPC метод зарегистрирован: ${name}`);
    }
    
    setupHandlers() {
        this.wss.on('connection', (ws) => {
            const clientId = Date.now().toString(36);
            this.clients.set(ws, { id: clientId, callCount: 0 });
            console.log(`RPC клиент подключен: ${clientId}`);
            
            ws.on('message', async (data) => {
                try {
                    const request = JSON.parse(data.toString());
                    const response = await this.handleRequest(request, ws);
                    if (response) {
                        ws.send(JSON.stringify(response));
                    }
                } catch (e) {
                    ws.send(JSON.stringify({
                        jsonrpc: '2.0',
                        error: {
                            code: -32700,
                            message: 'Parse error',
                            data: e.message
                        },
                        id: null
                    }));
                }
            });
            
            ws.on('close', () => {
                const client = this.clients.get(ws);
                console.log(`RPC клиент отключен: ${client?.id}`);
                this.clients.delete(ws);
            });
        });
    }
    
    async handleRequest(request, ws) {
        const client = this.clients.get(ws);
        
        // Поддержка batch запросов
        if (Array.isArray(request)) {
            const responses = [];
            for (const req of request) {
                const resp = await this.processSingleRequest(req, client);
                if (resp && req.id !== undefined) {
                    responses.push(resp);
                }
            }
            return responses.length ? responses : null;
        }
        
        return this.processSingleRequest(request, client);
    }
    
    async processSingleRequest(request, client) {
        const { jsonrpc, method, params, id } = request;
        
        // Валидация
        if (jsonrpc !== '2.0') {
            return {
                jsonrpc: '2.0',
                error: { code: -32600, message: 'Invalid Request' },
                id
            };
        }
        
        if (!this.methods.has(method)) {
            return {
                jsonrpc: '2.0',
                error: { code: -32601, message: `Method not found: ${method}` },
                id
            };
        }
        
        try {
            client.callCount++;
            const result = await this.methods.get(method)(params || {});
            
            // Уведомление (без id) не требует ответа
            if (id === undefined) {
                return null;
            }
            
            return {
                jsonrpc: '2.0',
                result,
                id
            };
        } catch (error) {
            return {
                jsonrpc: '2.0',
                error: { code: -32000, message: error.message },
                id
            };
        }
    }
}

// RPC Клиент
class RPCClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.callId = 0;
        this.pending = new Map();
    }
    
    connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);
            
            this.ws.on('open', () => {
                console.log('RPC клиент подключен');
                resolve();
            });
            
            this.ws.on('message', (data) => {
                const response = JSON.parse(data.toString());
                if (response.id !== undefined && this.pending.has(response.id)) {
                    const { resolve, reject } = this.pending.get(response.id);
                    this.pending.delete(response.id);
                    
                    if (response.error) {
                        reject(response.error);
                    } else {
                        resolve(response.result);
                    }
                }
            });
            
            this.ws.on('error', reject);
            this.ws.on('close', () => {
                console.log('RPC клиент отключен');
            });
        });
    }
    
    call(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = ++this.callId;
            const request = {
                jsonrpc: '2.0',
                method,
                params,
                id
            };
            
            this.pending.set(id, { resolve, reject });
            this.ws.send(JSON.stringify(request));
            
            // Таймаут
            setTimeout(() => {
                if (this.pending.has(id)) {
                    this.pending.delete(id);
                    reject(new Error('RPC call timeout'));
                }
            }, 10000);
        });
    }
    
    notify(method, params = {}) {
        const request = {
            jsonrpc: '2.0',
            method,
            params
        };
        this.ws.send(JSON.stringify(request));
    }
    
    close() {
        if (this.ws) this.ws.close();
    }
}

// Запуск RPC сервера
const rpcServer = new RPCServer(8080);
console.log('RPC WebSocket сервер на ws://localhost:8080');

// Демонстрация клиента
setTimeout(async () => {
    console.log('\n=== Демонстрация RPC клиента ===');
    const client = new RPCClient('ws://localhost:8080');
    
    await client.connect();
    
    try {
        const sum = await client.call('add', { a: 10, b: 20 });
        console.log('add(10,20) =', sum.result);
        
        const product = await client.call('multiply', { a: 5, b: 6 });
        console.log('multiply(5,6) =', product.result);
        
        const time = await client.call('getTime');
        console.log('getTime() =', time);
        
        const info = await client.call('getInfo');
        console.log('Server Info:', info);
        
        // Уведомление
        client.notify('echo', { message: 'Hello without response' });
        console.log('Уведомление отправлено');
        
    } catch (error) {
        console.error('RPC ошибка:', error);
    }
    
    // setTimeout(() => client.close(), 2000);
}, 1000);

// HTTP сервер для браузера
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>RPC over WebSocket</title>
            <style>
                body { font-family: monospace; padding: 20px; }
                #result { border: 1px solid #333; padding: 10px; background: #f5f5f5; 
                         min-height: 200px; font-family: monospace; white-space: pre-wrap; }
                button { margin: 5px; padding: 5px 15px; cursor: pointer; }
                input { padding: 5px; margin: 5px; width: 100px; }
            </style>
        </head>
        <body>
            <h1>JSON-RPC 2.0 over WebSocket</h1>
            <div>
                <h3>Калькулятор:</h3>
                <input type="number" id="num1" value="10">
                <input type="number" id="num2" value="5">
                <button onclick="rpcCall('add')">Сложить</button>
                <button onclick="rpcCall('multiply')">Умножить</button>
            </div>
            <div>
                <h3>Другие методы:</h3>
                <button onclick="rpcCall('getTime')">Время</button>
                <button onclick="rpcCall('getInfo')">Информация</button>
            </div>
            <div>
                <h3>Результат:</h3>
                <div id="result">Ожидание вызова...</div>
            </div>
            <div id="status">Статус: </div>
            
            <script>
                let ws = null;
                let callId = 0;
                const pending = new Map();
                
                function connect() {
                    ws = new WebSocket('ws://localhost:8080');
                    
                    ws.onopen = () => {
                        document.getElementById('status').innerHTML = 'Статус: <span style="color:green">Подключено</span>';
                        document.getElementById('result').innerHTML = 'Готов к RPC вызовам';
                    };
                    
                    ws.onmessage = (event) => {
                        const response = JSON.parse(event.data);
                        if (pending.has(response.id)) {
                            const { resolve } = pending.get(response.id);
                            pending.delete(response.id);
                            resolve(response);
                        }
                    };
                    
                    ws.onclose = () => {
                        document.getElementById('status').innerHTML = 'Статус: <span style="color:red">Отключено</span>';
                    };
                }
                
                function rpcCall(method) {
                    if (!ws || ws.readyState !== WebSocket.OPEN) {
                        document.getElementById('result').innerHTML = 'Ошибка: не подключено к серверу';
                        return;
                    }
                    
                    const id = ++callId;
                    let params = {};
                    
                    if (method === 'add' || method === 'multiply') {
                        const a = parseFloat(document.getElementById('num1').value);
                        const b = parseFloat(document.getElementById('num2').value);
                        params = { a, b };
                    }
                    
                    const request = {
                        jsonrpc: '2.0',
                        method: method,
                        params: params,
                        id: id
                    };
                    
                    const promise = new Promise((resolve) => {
                        pending.set(id, { resolve });
                    });
                    
                    ws.send(JSON.stringify(request));
                    
                    promise.then((response) => {
                        if (response.error) {
                            document.getElementById('result').innerHTML = \`Ошибка: \${JSON.stringify(response.error, null, 2)}\`;
                        } else {
                            document.getElementById('result').innerHTML = \`Результат: \${JSON.stringify(response.result, null, 2)}\`;
                        }
                    });
                    
                    document.getElementById('result').innerHTML = 'Выполняется...';
                }
                
                connect();
            </script>
        </body>
        </html>
    `);
});

server.listen(3000, () => {
    console.log('HTTP клиент для RPC на http://localhost:3000');
});
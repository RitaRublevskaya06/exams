// Импорт модуля ws для работы с WebSocket
const WebSocket = require('ws');

// Класс RPC сервера для обработки JSON-RPC 2.0 запросов через WebSocket
class RPCServer {
    constructor(port) {
        // Создание WebSocket сервера на указанном порту
        this.wss = new WebSocket.Server({ port });
        // Map для хранения зарегистрированных RPC методов
        this.methods = new Map();
        // Map для хранения подключенных клиентов
        this.clients = new Map();
        // Регистрация стандартных методов
        this.setupDefaultMethods();
        // Настройка обработчиков событий
        this.setupHandlers();
    }
    
    // Метод для настройки стандартных RPC методов
    setupDefaultMethods() {
        // Регистрация метода сложения
        this.registerMethod('add', (params) => {
            return { result: params.a + params.b };
        });
        
        // Регистрация метода умножения
        this.registerMethod('multiply', (params) => {
            return { result: params.a * params.b };
        });
        
        // Регистрация метода получения времени
        this.registerMethod('getTime', () => {
            return { timestamp: new Date().toISOString(), unix: Date.now() };
        });
        
        // Регистрация эхо-метода
        this.registerMethod('echo', (params) => {
            return { echo: params };
        });
        
        // Регистрация метода получения информации о сервере
        this.registerMethod('getInfo', () => {
            return {
                name: 'RPC Server',
                version: '1.0.0',
                methods: Array.from(this.methods.keys())
            };
        });
    }
    
    // Метод для регистрации новых RPC методов
    registerMethod(name, handler) {
        this.methods.set(name, handler);
        console.log(`RPC метод зарегистрирован: ${name}`);
    }
    
    // Метод для настройки обработчиков событий WebSocket
    setupHandlers() {
        // Обработка подключения новых клиентов
        this.wss.on('connection', (ws) => {
            const clientId = Date.now().toString(36);
            this.clients.set(ws, { id: clientId, callCount: 0 });
            console.log(`RPC клиент подключен: ${clientId}`);
            
            // Обработка получения сообщений от клиента
            ws.on('message', async (data) => {
                try {
                    // Парсинг JSON-RPC запроса
                    const request = JSON.parse(data.toString());
                    // Обработка запроса и получение ответа
                    const response = await this.handleRequest(request, ws);
                    // Отправка ответа, если он есть
                    if (response) {
                        ws.send(JSON.stringify(response));
                    }
                } catch (e) {
                    // Отправка ошибки парсинга
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
            
            // Обработка отключения клиента
            ws.on('close', () => {
                const client = this.clients.get(ws);
                console.log(`RPC клиент отключен: ${client?.id}`);
                this.clients.delete(ws);
            });
        });
    }
    
    // Метод для обработки RPC запросов
    async handleRequest(request, ws) {
        const client = this.clients.get(ws);
        
        // Обработка batch запросов (массив запросов)
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
        
        // Обработка одиночного запроса
        return this.processSingleRequest(request, client);
    }
    
    // Метод для обработки одиночного RPC запроса
    async processSingleRequest(request, client) {
        const { jsonrpc, method, params, id } = request;
        
        // Валидация версии JSON-RPC
        if (jsonrpc !== '2.0') {
            return {
                jsonrpc: '2.0',
                error: { code: -32600, message: 'Invalid Request' },
                id
            };
        }
        
        // Проверка существования метода
        if (!this.methods.has(method)) {
            return {
                jsonrpc: '2.0',
                error: { code: -32601, message: `Method not found: ${method}` },
                id
            };
        }
        
        try {
            // Увеличение счетчика вызовов для клиента
            client.callCount++;
            // Выполнение метода с параметрами
            const result = await this.methods.get(method)(params || {});
            
            // Уведомления (без id) не требуют ответа
            if (id === undefined) {
                return null;
            }
            
            // Возврат успешного ответа
            return {
                jsonrpc: '2.0',
                result,
                id
            };
        } catch (error) {
            // Возврат ошибки выполнения метода
            return {
                jsonrpc: '2.0',
                error: { code: -32000, message: error.message },
                id
            };
        }
    }
}

// Класс RPC клиента для взаимодействия с RPC сервером
class RPCClient {
    constructor(url) {
        // URL WebSocket сервера
        this.url = url;
        // Объект WebSocket соединения
        this.ws = null;
        // Счетчик для генерации уникальных ID запросов
        this.callId = 0;
        // Map для хранения ожидающих ответов запросов
        this.pending = new Map();
    }
    
    // Метод для подключения к серверу
    connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);
            
            // Обработка открытия соединения
            this.ws.on('open', () => {
                console.log('RPC клиент подключен');
                resolve();
            });
            
            // Обработка получе��ия сообщений
            this.ws.on('message', (data) => {
                const response = JSON.parse(data.toString());
                // Поиск соответствующего ожидающего запроса
                if (response.id !== undefined && this.pending.has(response.id)) {
                    const { resolve, reject } = this.pending.get(response.id);
                    this.pending.delete(response.id);
                    
                    // Обработка ошибки или успешного ответа
                    if (response.error) {
                        reject(response.error);
                    } else {
                        resolve(response.result);
                    }
                }
            });
            
            // Обработка ошибок соединения
            this.ws.on('error', reject);
            
            // Обработка закрытия соединения
            this.ws.on('close', () => {
                console.log('RPC клиент отключен');
            });
        });
    }
    
    // Метод для выполнения RPC вызова
    call(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = ++this.callId;
            const request = {
                jsonrpc: '2.0',
                method,
                params,
                id
            };
            
            // Сохранение колбэков для обработки ответа
            this.pending.set(id, { resolve, reject });
            // Отправка запроса
            this.ws.send(JSON.stringify(request));
            
            // Таймаут для запроса
            setTimeout(() => {
                if (this.pending.has(id)) {
                    this.pending.delete(id);
                    reject(new Error('RPC call timeout'));
                }
            }, 10000);
        });
    }
    
    // Метод для отправки уведомления (без ожидания ответа)
    notify(method, params = {}) {
        const request = {
            jsonrpc: '2.0',
            method,
            params
        };
        this.ws.send(JSON.stringify(request));
    }
    
    // Метод для закрытия соединения
    close() {
        if (this.ws) this.ws.close();
    }
}

// Запуск RPC сервера на порту 8080
const rpcServer = new RPCServer(8080);
console.log('RPC WebSocket сервер на ws://localhost:8080');

// Демонстрация работы RPC клиента
setTimeout(async () => {
    console.log('\n=== Демонстрация RPC клиента ===');
    const client = new RPCClient('ws://localhost:8080');
    
    // Подключение к серверу
    await client.connect();
    
    try {
        // Тестовые вызовы RPC методов
        const sum = await client.call('add', { a: 10, b: 20 });
        console.log('add(10,20) =', sum.result);
        
        const product = await client.call('multiply', { a: 5, b: 6 });
        console.log('multiply(5,6) =', product.result);
        
        const time = await client.call('getTime');
        console.log('getTime() =', time);
        
        const info = await client.call('getInfo');
        console.log('Server Info:', info);
        
        // Отправка уведомления
        client.notify('echo', { message: 'Hello without response' });
        console.log('Уведомление отправлено');
        
    } catch (error) {
        console.error('RPC ошибка:', error);
    }
}, 1000);

// Создание HTTP сервера для веб-клиента
const http = require('http');
const server = http.createServer((req, res) => {
    // Установка заголовков для HTML ответа
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    // Отправка HTML страницы с RPC клиентом
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
                    // Создание WebSocket соединения
                    ws = new WebSocket('ws://localhost:8080');
                    
                    // Обработка открытия соединения
                    ws.onopen = () => {
                        document.getElementById('status').innerHTML = 'Статус: <span style="color:green">Подключено</span>';
                        document.getElementById('result').innerHTML = 'Готов к RPC вызовам';
                    };
                    
                    // Обработка получения сообщений
                    ws.onmessage = (event) => {
                        const response = JSON.parse(event.data);
                        // Поиск соответствующего ожидающего запроса
                        if (pending.has(response.id)) {
                            const { resolve } = pending.get(response.id);
                            pending.delete(response.id);
                            resolve(response);
                        }
                    };
                    
                    // Обработка закрытия соединения
                    ws.onclose = () => {
                        document.getElementById('status').innerHTML = 'Статус: <span style="color:red">Отключено</span>';
                    };
                }
                
                function rpcCall(method) {
                    // Проверка подключения
                    if (!ws || ws.readyState !== WebSocket.OPEN) {
                        document.getElementById('result').innerHTML = 'Ошибка: не подключено к серверу';
                        return;
                    }
                    
                    const id = ++callId;
                    let params = {};
                    
                    // Подготовка ��араметров для методов калькулятора
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
                    
                    // Отправка запроса
                    ws.send(JSON.stringify(request));
                    
                    // Обработка ответа
                    promise.then((response) => {
                        if (response.error) {
                            document.getElementById('result').innerHTML = \`Ошибка: \${JSON.stringify(response.error, null, 2)}\`;
                        } else {
                            document.getElementById('result').innerHTML = \`Результат: \${JSON.stringify(response.result, null, 2)}\`;
                        }
                    });
                    
                    document.getElementById('result').innerHTML = 'Выполняется...';
                }
                
                // Автоматическое подключение
                connect();
            </script>
        </body>
        </html>
    `);
});

// Запуск HTTP сервера на порту 3000
server.listen(3000, () => {
    console.log('HTTP клиент для RPC на http://localhost:3000');
});
// websocket_ping_pong.js
const WebSocket = require('ws');

// WebSocket сервер с ping/pong
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Клиент подключился');
    
    let pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
            console.log('Ping отправлен');
        }
    }, 5000);
    
    ws.on('pong', () => {
        console.log('Pong получен');
    });
    
    ws.on('message', (message) => {
        console.log('Сообщение:', message.toString());
        ws.send(`Сервер получил: ${message}`);
    });
    
    ws.on('close', () => {
        clearInterval(pingInterval);
        console.log('Клиент отключился');
    });
});

// WebSocket клиент
function createWebSocketClient() {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.on('open', () => {
        console.log('Клиент: Подключен к серверу');
        
        // Отправка сообщений
        setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                const message = `Время: ${new Date().toLocaleTimeString()}`;
                ws.send(message);
                console.log(`Клиент отправил: ${message}`);
            }
        }, 3000);
    });
    
    ws.on('message', (data) => {
        console.log(`Клиент получил: ${data}`);
    });
    
    ws.on('ping', () => {
        console.log('Клиент: Получен ping, отправка pong');
        ws.pong();
    });
    
    ws.on('close', () => {
        console.log('Клиент: Соединение закрыто');
    });
    
    ws.on('error', (error) => {
        console.error('Клиент: Ошибка', error);
    });
    
    return ws;
}

console.log('WebSocket сервер с ping/pong на ws://localhost:8080');

// Запуск клиента через 1 секунду
setTimeout(() => {
    console.log('\n--- Запуск WebSocket клиента ---');
    createWebSocketClient();
}, 1000);

// Обработка завершения
process.on('SIGINT', () => {
    console.log('\nОстановка сервера...');
    wss.close(() => process.exit(0));
});
// Импорт модуля ws для работы с WebSocket
const WebSocket = require('ws');

// Создание WebSocket сервера с поддержкой ping/pong
const wss = new WebSocket.Server({ port: 8080 });

// Обработка подключения WebSocket клиентов
wss.on('connection', (ws) => {
    // Вывод сообщения о подключении клиента
    console.log('Клиент подключился');
    
    // Установка интервала для отправки ping сообщений
    let pingInterval = setInterval(() => {
        // Проверка, что соединение открыто
        if (ws.readyState === WebSocket.OPEN) {
            // Отправка ping сообщения
            ws.ping();
            console.log('Ping отправлен');
        }
    }, 5000); // Отправка каждые 5 секунд
    
    // Обработка получения pong ответа
    ws.on('pong', () => {
        console.log('Pong получен');
    });
    
    // Обработка получения сообщений от клиента
    ws.on('message', (message) => {
        // Вывод полученного сообщения
        console.log('Сообщение:', message.toString());
        // Отправка ответа клиенту
        ws.send(`Сервер получил: ${message}`);
    });
    
    // Обработка отключения клиента
    ws.on('close', () => {
        // Очистка интервала ping
        clearInterval(pingInterval);
        console.log('Клиент отключился');
    });
});

// Функция для создания WebSocket клиента
function createWebSocketClient() {
    // Создание WebSocket соединения
    const ws = new WebSocket('ws://localhost:8080');
    
    // Обработка открытия соединения
    ws.on('open', () => {
        console.log('Клиент: Подключен к серверу');
        
        // Установка интервала для отправки сообщений
        setInterval(() => {
            // Проверка, что соединение открыто
            if (ws.readyState === WebSocket.OPEN) {
                // Создание сообщения с текущим временем
                const message = `Время: ${new Date().toLocaleTimeString()}`;
                // Отправка сообщения
                ws.send(message);
                console.log(`Клиент отправил: ${message}`);
            }
        }, 3000); // Отправка каждые 3 секунды
    });
    
    // Обработка получения сообщений от сервера
    ws.on('message', (data) => {
        console.log(`Клиент получил: ${data}`);
    });
    
    // Обработка получения ping сообщения
    ws.on('ping', () => {
        console.log('Клиент: Получен ping, отправка pong');
        // Отправка pong ответа
        ws.pong();
    });
    
    // Обработка закрытия соединения
    ws.on('close', () => {
        console.log('Клиент: Соединение закрыто');
    });
    
    // Обработка ошибок соединения
    ws.on('error', (error) => {
        console.error('Клиент: Ошибка', error);
    });
    
    // Возврат объекта WebSocket соединения
    return ws;
}

// Вывод информации о запущенном сервере
console.log('WebSocket сервер с ping/pong на ws://localhost:8080');

// Запуск клиента через 1 секунду после старта сервера
setTimeout(() => {
    console.log('\n--- Запуск WebSocket клиента ---');
    createWebSocketClient();
}, 1000);

// Обработка сигнала SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\nОстановка сервера...');
    wss.close(() => process.exit(0));
});
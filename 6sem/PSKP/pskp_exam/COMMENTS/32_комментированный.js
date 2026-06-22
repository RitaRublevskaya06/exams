// Импорт модуля http для создания HTTP сервера
const http = require('http');
// Импорт модуля child_process для запуска дочерних процессов
const { spawn } = require('child_process');
// Импорт модуля readline для работы с вводом из командной строки
const readline = require('readline');

// Создание интерфейса для чтения ввода из командной строки
const rl = readline.createInterface({
    input: process.stdin, // Использование стандартного ввода
    output: process.stdout // Использование стандартного вывода
});

// Вывод приветственного сообщения и доступных команд
console.log('Сервер запущен. Введите команды:');
console.log('  stats - показать статистику');
console.log('  stop  - остановить сервер');
console.log('  help  - показать справку');

// Переменная для подсчета количества запросов
let requestCount = 0;
// Массив для хранения логов запросов
const requestLog = [];

// Создание HTTP сервера
const server = http.createServer((req, res) => {
    // Увеличение счетчика запросов
    requestCount++;
    // Создание записи лога для текущего запроса
    const logEntry = {
        timestamp: new Date().toISOString(), // Временная метка
        method: req.method, // HTTP метод
        url: req.url, // URL запроса
        ip: req.socket.remoteAddress // IP адрес клиента
    };
    // Добавление записи в лог
    requestLog.push(logEntry);
    
    // Вывод информации о запросе в стандартный вывод
    console.log(`[${logEntry.timestamp}] ${req.method} ${req.url} - ${req.socket.remoteAddress}`);
    
    // Обработка запроса для получения статистики
    if (req.url === '/stats') {
        // Установка заголовков для JSON ответа
        res.writeHead(200, { 'Content-Type': 'application/json' });
        // Отправка статистики в формате JSON
        res.end(JSON.stringify({
            totalRequests: requestCount,
            recentRequests: requestLog.slice(-10) // Последние 10 запросов
        }));
    } 
    // Обработка запроса для выполнения команд
    else if (req.url === '/execute') {
        // Инициализация переменной для тела запроса
        let body = '';
        // Сбор данных тела запроса
        req.on('data', chunk => { body += chunk.toString(); });
        // Обработка завершения получения данных
        req.on('end', () => {
            try {
                // Парсинг JSON из тела запроса
                const { command } = JSON.parse(body);
                // Безопасное выполнение команды (только echo для демонстрации)
                const safeCommand = 'echo';
                const safeArgs = ['Команда выполняется безопасно'];
                // Запуск дочернего процесса
                const child = spawn(safeCommand, safeArgs);
                let output = '';
                
                // Обработка вывода команды
                child.stdout.on('data', (data) => {
                    output += data.toString();
                    // Вывод в стандартный вывод сервера
                    process.stdout.write(`[CMD OUT] ${data}`);
                });
                
                // Обработка ошибок команды
                child.stderr.on('data', (data) => {
                    output += data.toString();
                    // Вывод в стандартный вывод ошибок
                    process.stderr.write(`[CMD ERR] ${data}`);
                });
                
                // Обработка завершения команды
                child.on('close', (code) => {
                    // Отправка результата выполнения команды
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        command,
                        exitCode: code,
                        output
                    }));
                });
            } catch (e) {
                // Обработка ошибки парсинга JSON
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    }
    // Обработка всех других запросов (главная страница)
    else {
        // Установка заголовков для HTML ответа
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        // Отправка HTML страницы с информацией о сервере
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>Сервер с stdin/stdout</title></head>
            <body>
                <h1>Сервер с использованием stdin/stdout</h1>
                <p>Всего запросов: ${requestCount}</p>
                <p>Проверьте консоль сервера для вывода логов</p>
                <a href="/stats">Статистика</a>
            </body>
            </html>
        `);
    }
});

// Запуск сервера на порту 3000
server.listen(3000, () => {
    console.log(`HTTP сервер на порту 3000`);
});

// Обработка ввода из командной строки
rl.on('line', (input) => {
    // Очистка и приведение к нижнему регистру введенной команды
    const cmd = input.trim().toLowerCase();
    
    // Обработка различных команд
    switch (cmd) {
        case 'stats':
            // Вывод статистики
            console.log('\n=== СТАТИСТИКА ===');
            console.log(`Всего запросов: ${requestCount}`);
            console.log(`Последние 5 запросов:`);
            requestLog.slice(-5).forEach(log => {
                console.log(`  ${log.timestamp} ${log.method} ${log.url}`);
            });
            console.log('==================\n');
            break;
            
        case 'stop':
            // Остановка сервера
            console.log('Остановка сервера...');
            rl.close();
            server.close(() => {
                console.log('Сервер остановлен');
                process.exit(0);
            });
            break;
            
        case 'help':
            // Вывод справки
            console.log('\n=== ДОСТУПНЫЕ КОМАНДЫ ===');
            console.log('stats - показать статистику запросов');
            console.log('stop  - остановить сервер');
            console.log('help  - показать эту справку');
            console.log('========================\n');
            break;
            
        default:
            // Обработка неизвестной команды
            console.log(`Неизвестная команда: ${cmd}. Введите "help" для справки.`);
    }
});

// Обработка сигнала SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\nПолучен SIGINT. Остановка...');
    server.close(() => process.exit(0));
});
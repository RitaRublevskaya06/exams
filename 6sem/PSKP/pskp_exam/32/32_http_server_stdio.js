const http = require('http');
const { spawn } = require('child_process');
const readline = require('readline');

// HTTP-сервер: применение стандартного ввода и стандартного вывода
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Сервер запущен. Введите команды:');
console.log('  stats - показать статистику');
console.log('  stop  - остановить сервер');
console.log('  help  - показать справку');

let requestCount = 0;
const requestLog = [];

const server = http.createServer((req, res) => {
    requestCount++;
    const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        ip: req.socket.remoteAddress
    };
    requestLog.push(logEntry);
    
    // Вывод в стандартный вывод
    console.log(`[${logEntry.timestamp}] ${req.method} ${req.url} - ${req.socket.remoteAddress}`);
    
    if (req.url === '/stats') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            totalRequests: requestCount,
            recentRequests: requestLog.slice(-10)
        }));
    } 
    else if (req.url === '/execute') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { command } = JSON.parse(body);
                // Выполнение команды и вывод результата
                // Безопасное выполнение команды - только echo для демонстрации
                const safeCommand = 'echo';
                const safeArgs = ['Команда выполняется безопасно'];
                const child = spawn(safeCommand, safeArgs);
                let output = '';
                
                child.stdout.on('data', (data) => {
                    output += data.toString();
                    process.stdout.write(`[CMD OUT] ${data}`);
                });
                
                child.stderr.on('data', (data) => {
                    output += data.toString();
                    process.stderr.write(`[CMD ERR] ${data}`);
                });
                
                child.on('close', (code) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        command,
                        exitCode: code,
                        output
                    }));
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
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

server.listen(3000, () => {
    console.log(`HTTP сервер на порту 3000`);
});

// Обработка стандартного ввода
rl.on('line', (input) => {
    const cmd = input.trim().toLowerCase();
    
    switch (cmd) {
        case 'stats':
            console.log('\n=== СТАТИСТИКА ===');
            console.log(`Всего запросов: ${requestCount}`);
            console.log(`Последние 5 запросов:`);
            requestLog.slice(-5).forEach(log => {
                console.log(`  ${log.timestamp} ${log.method} ${log.url}`);
            });
            console.log('==================\n');
            break;
            
        case 'stop':
            console.log('Остановка сервера...');
            rl.close();
            server.close(() => {
                console.log('Сервер остановлен');
                process.exit(0);
            });
            break;
            
        case 'help':
            console.log('\n=== ДОСТУПНЫЕ КОМАНДЫ ===');
            console.log('stats - показать статистику запросов');
            console.log('stop  - остановить сервер');
            console.log('help  - показать эту справку');
            console.log('========================\n');
            break;
            
        default:
            console.log(`Неизвестная команда: ${cmd}. Введите "help" для справки.`);
    }
});

// Обработка сигналов
process.on('SIGINT', () => {
    console.log('\nПолучен SIGINT. Остановка...');
    server.close(() => process.exit(0));
});
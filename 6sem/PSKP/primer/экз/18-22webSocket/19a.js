const WebSocket = require('ws');


setTimeout(() => {
    const ws = new WebSocket('ws://localhost:5000');

    ws.on('message', msg => {
        console.log('message: ', msg.toString());
    })

    ws.on('pong', data => {
        console.log(`pong-client: ${data.toString()}`);
    });

    setInterval(() => {
        ws.ping('ping from client');
    }, 5000);
}, 500);
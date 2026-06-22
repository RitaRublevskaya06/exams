let rpcWSS = require('rpc-websockets').Server;

let server = new rpcWSS({port: 4000, host: 'localhost'});

server.setAuth(l => l.login === 'anna' && l.password === '123');

server.register('square', params => {
    return (params.length === 2) ? (params[0] * params[1]) : (Math.PI * (params[0] ** 2));
}).public();

server.register('sum', params => {
    let sum = 0;
    params.forEach(elem => {
        if(Number.isInteger(elem))
            sum += elem;
    });
    return sum;
}).public();


server.register('mul', params => {
    let mul = 1;
    params.forEach(elem => {
        if (Number.isInteger(elem))
            mul *= elem;
    });
    return mul;
}).public();

server.register('fib', params => {
    const n = params[0];
    return fibonacciSequence(n);
}).protected();

server.register('fact', params => {
    if (params.length !== 1)
        return [1];
    return factorial(params);
}).protected();


function factorial(n) {
    return (n == 1 || n == 0) ? 1 : n * factorial(n - 1);
}

function fibonacciSequence(n) {
    let arr = [];
    if (n === 1) {
        arr.push(0);
    } else if (n >= 2) {
        arr = [0, 1];

        for (let i = 2; i < n; i++) {
            const nextElement = arr[i - 1] + arr[i - 2];
            arr.push(nextElement);
        }
    }
    return arr;
}
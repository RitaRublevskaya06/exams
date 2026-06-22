//go:build !client
// Собирать без тега client — это сервер (не Go-клиент).

// package main — задания 34–35: WebSocket echo-сервер + HTML-клиент.
package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket" // RFC 6455 WebSocket поверх HTTP Upgrade
)

// upgrader — настройки апгрейда HTTP → WebSocket.
var upgrader = websocket.Upgrader{
	// CheckOrigin: браузер шлёт Origin; return true — разрешить любой (для учебы).
	CheckOrigin: func(*http.Request) bool { return true },
}

// wsHandler — задание 34: эхо-сервер по ws://host/ws.
func wsHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade: 101 Switching Protocols, возвращает *websocket.Conn.
	conn, err := upgrader.Upgrade(w, r, nil) // nil — без доп. заголовков ответа
	if err != nil {
		return
	}
	defer conn.Close() // закрыть TCP/WebSocket при выходе

	for { // цикл чтения сообщений, пока клиент не отключился
		_, msg, err := conn.ReadMessage() // messageType игнорируем _; msg — []byte payload
		if err != nil {
			break // нормальное или аварийное закрытие
		}
		// TextMessage = 1; []byte("Echo: "+string(msg)) — текстовый фрейм UTF-8.
		conn.WriteMessage(websocket.TextMessage, []byte("Echo: "+string(msg)))
	}
}

// htmlClient — задание 35: одна HTML-страница с JS WebSocket в браузере.
func htmlClient(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html") // браузер отрисует как HTML
	// Обратные кавычки ` — многострочная строка; внутри JS, не Go.
	w.Write([]byte(`<!DOCTYPE html>
<html><head><title>WebSocket</title></head>
<body>
<h1>WebSocket (задание 35)</h1>
<div id="log" style="height:200px;overflow:auto;border:1px solid #ccc;padding:8px"></div>
<input id="msg"><button onclick="send()">Отправить</button>
<script>
let ws;
function log(t){document.getElementById('log').innerHTML+='<div>'+t+'</div>'}
function send(){
  if(!ws||ws.readyState!==1){log('не подключено');return}
  ws.send(document.getElementById('msg').value);
}
ws=new WebSocket('ws://localhost:8095/ws');
ws.onopen=()=>log('подключено');
ws.onmessage=e=>log('ответ: '+e.data);
</script>
</body></html>`))
}

func main() {
	http.HandleFunc("/ws", wsHandler)   // WebSocket endpoint
	http.HandleFunc("/", htmlClient)    // GET / → HTML

	log.Println("WebSocket: :8095/ws")
	log.Println("HTML-клиент: http://localhost:8095")
	log.Println("Go-клиент: go run -tags client .")

	http.ListenAndServe(":8095", nil) // DefaultServeMux
}

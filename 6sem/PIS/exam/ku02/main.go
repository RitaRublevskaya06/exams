package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(*http.Request) bool { return true },
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}
		conn.WriteMessage(websocket.TextMessage, []byte("Echo: "+string(msg)))
	}
}

func htmlClient(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(`<!DOCTYPE html>
<html><head><title>WebSocket</title></head>
<body>
<h1>WebSocket (задание 35)</h1>
<div id="log" style="height:200px;overflow:auto;border:1px solid #ccc;padding:8px"></div>
<input id="msg"><button onclick="send()">Send</button>
<script>
let ws;
function log(t){document.getElementById('log').innerHTML+='<div>'+t+'</div>'}
function send(){
  if(!ws||ws.readyState!==1){log('not connected');return}
  ws.send(document.getElementById('msg').value);
}
ws=new WebSocket('ws://localhost:8095/ws');
ws.onopen=()=>log('connected');
ws.onmessage=e=>log('answer: '+e.data);
</script>
</body></html>`))
}

func main() {
	http.HandleFunc("/ws", wsHandler)
	http.HandleFunc("/", htmlClient)

	log.Println("WebSocket: :8095/ws")
	log.Println("HTML-клиент: http://localhost:8095")

	http.ListenAndServe(":8095", nil)
}

//go:build client
// Собирать с -tags client: go run -tags client .

// package main — задание 34: Go-клиент WebSocket (нужен запущенный сервер из main.go).
package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

func main() {
	// DefaultDialer.Dial: HTTP GET + Upgrade → *Conn; второй возврат — http.Response (игнорируем _).
	conn, _, err := websocket.DefaultDialer.Dial("ws://localhost:8095/ws", nil)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	for _, msg := range []string{"Hello", "WebSocket", "Go client"} {
		conn.WriteMessage(websocket.TextMessage, []byte(msg)) // отправка текстового фрейма
		_, resp, err := conn.ReadMessage()                    // ждём ответ сервера
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("%s -> %s\n", msg, resp) // resp — []byte, печатается как строка
		time.Sleep(time.Second)             // пауза 1 с между сообщениями
	}
}

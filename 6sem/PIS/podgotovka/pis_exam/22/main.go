// package main — задание 22: HTTP-сервер, каждый запрос в своей горутине.
package main

import (
	"fmt"       // Printf в обработчик
	"net/http"  // сервер HTTP: Handler, ResponseWriter, Request
	"time"      // время для метки в логе
)

// handler — функция-обработчик; сигнатура http.HandlerFunc.
// w — куда писать ответ клиенту; r — входящий запрос (заголовки, URL, тело).
func handler(w http.ResponseWriter, r *http.Request) {
	// time.Now().Format("15:04:05") — локальное время; r.RemoteAddr — IP:port клиента; r.URL.Path — путь.
	fmt.Printf("[%s] Запрос от %s: %s\n", time.Now().Format("15:04:05"), r.RemoteAddr, r.URL.Path)
	// Fprintf пишет в w (тело ответа); клиент получит text/plain по умолчанию.
	fmt.Fprintf(w, "Hello! Вы запросили: %s\n", r.URL.Path)
}

func main() {
	// HandleFunc регистрирует маршрут "/" на DefaultServeMux (глобальная таблица маршрутов).
	http.HandleFunc("/", handler)

	fmt.Println("Сервер запущен на http://localhost:8082")
	fmt.Println("Параллельная обработка: каждый запрос в отдельной горутине")
	fmt.Println("Для проверки выполните:")
	fmt.Println("  curl http://localhost:8082/test")
	fmt.Println("  curl http://localhost:8082/hello")

	// ListenAndServe блокирует main: слушает :8082; nil = DefaultServeMux.
	// Для каждого TCP-соединения runtime запускает go handler(...).
	http.ListenAndServe(":8082", nil)
}

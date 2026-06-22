// package main — задание 25: gorilla/mux + JSON API.
package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux" // Router: маршруты, методы HTTP, переменные пути
)

// StatusResponse — тело JSON-ответа.
type StatusResponse struct {
	Status  string `json:"status"`  // поле status в JSON
	Message string `json:"message"` // поле message
}

// apiData — обработчик GET /api/data.
func apiData(w http.ResponseWriter, r *http.Request) {
	resp := StatusResponse{ // литерал: Status "ok", Message "Данные получены"
		Status:  "ok",
		Message: "Данные получены",
	}

	w.Header().Set("Content-Type", "application/json") // клиент поймёт, что пришёл JSON
	json.NewEncoder(w).Encode(resp)                    // Encode → JSON bytes → w
}

func main() {
	r := mux.NewRouter() // *mux.Router — свой ServeMux с поддержкой шаблонов пути
	// HandleFunc + Methods("GET") — маршрут только для GET (иначе 405).
	r.HandleFunc("/api/data", apiData).Methods("GET")

	log.Println("Сервер запущен на :8085")
	log.Println("GET /api/data - возвращает JSON")

	// r реализует http.Handler — передаём в ListenAndServe вместо nil.
	http.ListenAndServe(":8085", r)
}

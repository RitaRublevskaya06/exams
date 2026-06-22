// package main — задание 29: query-параметры (?q=...&page=...).
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func searchHandler(w http.ResponseWriter, r *http.Request) {
	// r.URL.Query() → url.Values (map[string][]string); Get берёт первое значение ключа.
	query := r.URL.Query().Get("q")     // ?q=golang
	page := r.URL.Query().Get("page")   // &page=2
	limit := r.URL.Query().Get("limit") // &limit=20

	fmt.Fprintf(w, "Результаты поиска:\n")
	fmt.Fprintf(w, "  query: %s\n", query)
	fmt.Fprintf(w, "  page: %s\n", page)
	fmt.Fprintf(w, "  limit: %s\n", limit)
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/search", searchHandler).Methods("GET")

	log.Println("Сервер запущен на :8089")
	log.Println("GET /search?q=go&page=1&limit=10")
	log.Println("Проверка: curl 'http://localhost:8089/search?q=golang&page=2&limit=20'")

	http.ListenAndServe(":8089", r)
}

// package main — задание 28: path-параметр {id} в URL.
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func userHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)  // из шаблона /users/{id} извлекается id
	userID := vars["id"] // строка, например "123"
	fmt.Fprintf(w, "Запрошен пользователь с ID: %s\n", userID)
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/users/{id}", userHandler).Methods("GET") // {id} — любая подстрока без /

	log.Println("Сервер запущен на :8088")
	log.Println("GET /users/{id} - path параметр")
	log.Println("Проверка: curl http://localhost:8088/users/123")

	http.ListenAndServe(":8088", r)
}

// package main — задание 32: «маршрутизация» по query ?action=...
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func dataHandler(w http.ResponseWriter, r *http.Request) {
	action := r.URL.Query().Get("action") // одна ручка /data — поведение по параметру

	switch action { // switch по строке action
	case "create":
		fmt.Fprintln(w, "Создание новой записи") // Fprintln — строка + \n в w
	case "update":
		fmt.Fprintln(w, "Обновление записи")
	case "delete":
		fmt.Fprintln(w, "Удаление записи")
	default: // action пустой или неизвестный
		fmt.Fprintln(w, "Список записей (действие по умолчанию)")
	}
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/data", dataHandler).Methods("GET")

	log.Println("Сервер запущен на :8092")
	log.Println("Маршрутизация по query-параметру action:")
	log.Println("  GET /data              - list")
	log.Println("  GET /data?action=create - create")
	log.Println("  GET /data?action=update - update")
	log.Println("  GET /data?action=delete - delete")
	log.Println("Проверка: curl 'http://localhost:8092/data?action=create'")

	http.ListenAndServe(":8092", r)
}

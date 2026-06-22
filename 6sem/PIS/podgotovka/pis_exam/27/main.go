// package main — задание 27: REST GET/POST на один путь /products.
package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

// products — in-memory хранилище (срез в RAM, не БД).
var products = []Product{
	{ID: "1", Name: "Laptop", Price: 999.99},
	{ID: "2", Name: "Mouse", Price: 29.99},
}

func getProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products) // весь срез → JSON-массив
}

func createProduct(w http.ResponseWriter, r *http.Request) {
	var p Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Ошибка парсинга", http.StatusBadRequest)
		return
	}
	products = append(products, p) // добавляем в глобальный срез
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) // HTTP 201 Created
	json.NewEncoder(w).Encode(p)      // вернуть созданный объект
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/products", getProducts).Methods("GET")    // один URL — разные методы
	r.HandleFunc("/products", createProduct).Methods("POST") // mux различает по Method

	log.Println("Сервер запущен на :8087")
	log.Println("GET  /products - список продуктов")
	log.Println("POST /products - создать продукт")

	http.ListenAndServe(":8087", r)
}

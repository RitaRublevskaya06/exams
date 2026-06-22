// package main — задание 26: POST form-urlencoded + path-параметр {id}.
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func formHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)      // map[string]string — именованные группы из шаблона маршрута
	userID := vars["id"]     // ключ "id" из /user/{id:[0-9]+}

	r.ParseForm()            // разбирает application/x-www-form-urlencoded в r.Form
	name := r.FormValue("name")   // значение поля name из тела POST
	email := r.FormValue("email") // поле email

	log.Printf("Form data: id=%s, name=%s, email=%s", userID, name, email)

	fmt.Fprintf(w, "Получено: ID=%s, Name=%s, Email=%s\n", userID, name, email)
}

func main() {
	r := mux.NewRouter()
	// {id:[0-9]+} — переменная id только из цифр (регулярка в mux).
	r.HandleFunc("/user/{id:[0-9]+}", formHandler).Methods("POST")

	log.Println("Сервер запущен на :8086")
	log.Println("POST /user/{id} с Content-Type: application/x-www-form-urlencoded")
	log.Println("Проверка: curl -X POST http://localhost:8086/user/123 -d 'name=Alice&email=alice@ex.com'")

	http.ListenAndServe(":8086", r)
}

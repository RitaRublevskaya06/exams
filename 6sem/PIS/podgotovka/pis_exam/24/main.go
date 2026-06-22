// package main — задание 24: приём JSON в теле POST-запроса.
package main

import (
	"encoding/json" // Decoder/Encoder, теги struct `json:"..."`
	"log"
	"net/http"
)

// UserRequest — DTO входа; теги json задают имена полей в JSON (не имена полей Go).
type UserRequest struct {
	Name  string `json:"name"`  // в JSON ключ "name" → поле Name
	Email string `json:"email"` // ключ "email"
}

// UserResponse — DTO ответа сервера клиенту.
type UserResponse struct {
	Message string      `json:"message"` // строка статуса
	User    UserRequest `json:"user"`  // вложенный объект user
}

// userHandler — обработчик POST /user.
func userHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost { // MethodPost == "POST"; защита от GET и др.
		http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed) // 405 + текст
		return // выход из handler без тела JSON
	}

	var req UserRequest // пустая структура — сюда распарсится JSON
	// NewDecoder(r.Body) читает поток тела запроса; Decode разбирает JSON в &req.
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Ошибка парсинга JSON", http.StatusBadRequest) // 400
		return
	}

	log.Printf("Получен пользователь: %s, %s", req.Name, req.Email)

	resp := UserResponse{ // литерал структуры ответа
		Message: "Пользователь успешно создан",
		User:    req, // копия req в поле User
	}

	w.Header().Set("Content-Type", "application/json") // заголовок ответа: JSON
	w.WriteHeader(http.StatusCreated)                  // 201 — явно до записи тела
	json.NewEncoder(w).Encode(resp)                    // сериализация resp → JSON в w
}

func main() {
	http.HandleFunc("/user", userHandler)

	log.Println("Сервер запущен на :8084")
	log.Println("POST /user с JSON телом")
	log.Println("Проверка: curl -X POST http://localhost:8084/user -H 'Content-Type: application/json' -d '{\"name\":\"John\",\"email\":\"john@ex.com\"}'")

	http.ListenAndServe(":8084", nil)
}

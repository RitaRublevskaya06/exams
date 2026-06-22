// package main — задание 23: несколько маршрутов на DefaultServeMux.
package main

import (
	"log"      // Printf с префиксом времени
	"net/http" // HTTP-сервер
)

// homePage — обработчик GET / (и любых путей, если не зарегистрирован более точный).
func homePage(w http.ResponseWriter, r *http.Request) {
	log.Printf("Home page accessed from %s", r.RemoteAddr) // %s — строка адреса клиента
	w.Write([]byte("Добро пожаловать на главную страницу!\n")) // Write([]byte) — тело ответа
}

func aboutPage(w http.ResponseWriter, r *http.Request) {
	log.Printf("About page accessed from %s", r.RemoteAddr)
	w.Write([]byte("О нас: Мы изучаем Go!\n"))
}

func contactPage(w http.ResponseWriter, r *http.Request) {
	log.Printf("Contact page accessed from %s", r.RemoteAddr)
	w.Write([]byte("Контакты: email@example.com\n"))
}

func main() {
	http.HandleFunc("/", homePage)       // префиксное совпадение: /, /foo тоже попадёт сюда
	http.HandleFunc("/about", aboutPage)   // точный путь /about
	http.HandleFunc("/contact", contactPage)

	log.Println("Сервер запущен на :8083")
	log.Println("Маршруты:")
	log.Println("  GET /        - главная")
	log.Println("  GET /about   - о нас")
	log.Println("  GET /contact - контакты")

	http.ListenAndServe(":8083", nil) // порт 8083, маршрутизатор по умолчанию
}

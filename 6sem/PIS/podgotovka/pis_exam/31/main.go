// package main — задание 31: загрузка файла multipart/form-data.
package main

import (
	"fmt"
	"io" // io.Copy — копирование потоков
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed)
		return
	}

	// ParseMultipartForm: 10 << 20 = 10*2^20 байт (~10 MiB) — лимит памяти для формы.
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Ошибка парсинга формы", http.StatusBadRequest)
		return
	}

	// FormFile("file") — поле формы с name="file"; возвращает io.Reader, *FileHeader, err.
	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Ошибка получения файла", http.StatusBadRequest)
		return
	}
	defer file.Close() // закрыть временный файл multipart

	os.MkdirAll("./uploads", 0755)

	dst, err := os.Create("./uploads/" + handler.Filename) // Filename из заголовка Content-Disposition
	if err != nil {
		http.Error(w, "Ошибка сохранения файла", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, file) // копирует байты из file в dst на диск
	if err != nil {
		http.Error(w, "Ошибка копирования", http.StatusInternalServerError)
		return
	}

	log.Printf("Загружен файл: %s, размер: %d bytes", handler.Filename, handler.Size)
	fmt.Fprintf(w, "Файл %s успешно загружен!\n", handler.Filename)
}

func main() {
	os.MkdirAll("./uploads", 0755)

	r := mux.NewRouter()
	r.HandleFunc("/upload", uploadHandler).Methods("POST")

	log.Println("Сервер запущен на :8091")
	log.Println("POST /upload - загрузка файлов (multipart/form-data)")
	log.Println("Проверка: curl -X POST -F 'file=@./static/test.txt' http://localhost:8091/upload")

	http.ListenAndServe(":8091", r)
}

// package main — задание 30: раздача статики (FileServer) и ServeFile.
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func main() {
	os.MkdirAll("./static", 0755) // каталог для файлов; 0755 — права unix
	os.WriteFile("./static/test.txt", []byte("Это тестовый файл для скачивания"), 0644)
	os.WriteFile("./static/image.jpg", []byte("fake image data"), 0644)

	r := mux.NewRouter()

	// PathPrefix — все URL /files/...; StripPrefix убирает /files/ перед поиском на диске.
	// http.Dir("./static") — корень файловой системы для FileServer.
	// FileServer отдаёт файлы по HTTP GET.
	r.PathPrefix("/files/").Handler(http.StripPrefix("/files/", http.FileServer(http.Dir("./static"))))

	// Явный handler: /download/test.txt → файл ./static/test.txt
	r.HandleFunc("/download/{filename}", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		filename := vars["filename"] // имя файла из URL
		http.ServeFile(w, r, "./static/"+filename) // ServeFile: Content-Type, Range, 404
	})

	log.Println("Сервер запущен на :8090")
	log.Println("Статические файлы:")
	log.Println("  GET /files/test.txt")
	log.Println("  GET /download/test.txt")
	log.Println("Проверка: curl -O http://localhost:8090/files/test.txt")

	http.ListenAndServe(":8090", r)
}

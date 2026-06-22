// package main — задание 36: WebDAV-сервер (файлы по HTTP PROPFIND/GET/PUT...).
package main

import (
	"log"
	"net/http"
	"os"

	"golang.org/x/net/webdav" // расширение net: Handler, Dir, блокировки
)

func main() {
	os.MkdirAll("./webdav_data", 0755)
	os.WriteFile("./webdav_data/test.txt", []byte("Hello WebDAV!"), 0644)

	// webdav.Handler — http.Handler для методов WebDAV.
	handler := &webdav.Handler{
		FileSystem: webdav.Dir("./webdav_data"), // Dir — адаптер os.FileInfo к webdav.FileSystem
		LockSystem: webdav.NewMemLS(),           // блокировки в памяти (для PUT/LOCK)
	}

	log.Println("WebDAV: http://localhost:8096/")
	log.Println("  curl http://localhost:8096/test.txt")

	// handler обрабатывает GET, PUT, PROPFIND, DELETE и др.
	http.ListenAndServe(":8096", handler)
}

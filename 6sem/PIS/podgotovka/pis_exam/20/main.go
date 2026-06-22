// package main — исполняемая программа (задание 20: database/sql).
package main

import (
	"database/sql" // стандартный интерфейс к SQL: Open, Query, Exec, транзакции
	"fmt"          // вывод в консоль
	"log"          // логирование; log.Fatal завершает процесс при ошибке

	_ "github.com/mattn/go-sqlite3" // blank import _: регистрирует драйвер "sqlite3" в database/sql
)

// User — структура для Scan: поля совпадают с колонками таблицы по порядку/типу.
type User struct {
	ID    int    // INTEGER в SQLite → int в Go
	Name  string // TEXT → string (UTF-8)
	Email string
}

func main() {
	fmt.Println("=== ЗАДАНИЕ 20: database/sql ===\n")

	// sql.Open не открывает соединение сразу — создаёт *sql.DB (пул соединений).
	// "sqlite3" — имя драйвера, зарегистрированного пакетом go-sqlite3.
	db, err := sql.Open("sqlite3", "./test.db") // "./test.db" — путь к файлу БД SQLite
	if err != nil {
		log.Fatal(err) // Fatal печатает err и вызывает os.Exit(1)
	}
	defer db.Close() // defer: Close() выполнится при выходе из main (освободить ресурсы)

	// Exec выполняет SQL без возврата строк; `...` — сырая строка (без экранирования).
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		email TEXT NOT NULL
	)`) // _ — игнорируем sql.Result; err — ошибка SQLite
	if err != nil {
		log.Fatal(err)
	}

	insert := `INSERT INTO users (name, email) VALUES (?, ?)` // ? — плейсхолдеры (защита от SQL-инъекций)
	db.Exec(insert, "Alice", "alice@example.com")             // аргументы подставляются вместо ?
	db.Exec(insert, "Bob", "bob@example.com")

	rows, err := db.Query("SELECT id, name, email FROM users") // Query → *sql.Rows (курсор)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close() // обязательно закрыть курсор

	fmt.Println("Пользователи:")
	for rows.Next() { // Next() сдвигает курсор; false когда строки кончились
		var u User
		// Scan копирует значения колонок в &u.ID, &u.Name, &u.Email (нужны указатели).
		if err := rows.Scan(&u.ID, &u.Name, &u.Email); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("  %d: %s <%s>\n", u.ID, u.Name, u.Email)
	}

	tx, _ := db.Begin() // Begin() — транзакция *sql.Tx; _ игнорирует err (для учебного примера)
	tx.Exec(insert, "Charlie", "charlie@example.com")
	tx.Exec("UPDATE users SET email = ? WHERE name = ?", "alice_new@example.com", "Alice")
	tx.Commit() // Commit() фиксирует изменения; Rollback() откатил бы при ошибке
	fmt.Println("\nТранзакция: добавлен Charlie, обновлён email Alice")
}

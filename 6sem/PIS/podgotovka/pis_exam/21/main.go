// package main — задание 21: ORM GORM поверх SQLite.
package main

import (
	"fmt"
	"log"

	"gorm.io/driver/sqlite" // диалект GORM для SQLite (файл .db)
	"gorm.io/gorm"          // ORM: модели, миграции, CRUD без сырого SQL
)

// Product — модель таблицы; gorm.Model встраивает ID, CreatedAt, UpdatedAt, DeletedAt.
type Product struct {
	gorm.Model        // встроенные поля: uint ID, time.Time ..., gorm.DeletedAt для soft delete
	Name  string      // колонка name
	Price float64     // колонка price
	Stock int         // колонка stock
}

func main() {
	fmt.Println("=== ЗАДАНИЕ 21: GORM ===\n")

	// gorm.Open возвращает *gorm.DB; sqlite.Open("gorm.db") — DSN файла БД.
	db, err := gorm.Open(sqlite.Open("gorm.db"), &gorm.Config{}) // Config{} — настройки по умолчанию
	if err != nil {
		log.Fatal(err)
	}

	// AutoMigrate создаёт/обновляет таблицу products по полям структуры.
	db.AutoMigrate(&Product{}) // &Product{} — указатель на тип для рефлексии GORM

	// Create вставляет одну запись; GORM заполняет ID и timestamps после INSERT.
	db.Create(&Product{Name: "Laptop", Price: 999.99, Stock: 10})
	// Create принимает срез — пакетная вставка нескольких строк.
	db.Create([]Product{
		{Name: "Mouse", Price: 29.99, Stock: 50},
		{Name: "Keyboard", Price: 79.99, Stock: 30},
	})

	var laptop Product // нулевая структура — сюда запишет First
	// Where("name = ?", "Laptop") — условие; ? подставляется безопасно; First — первая строка.
	db.Where("name = ?", "Laptop").First(&laptop)
	// Model(&laptop) указывает запись; Update меняет поле Price в БД.
	db.Model(&laptop).Update("Price", 899.99)

	var all []Product // срез для нескольких строк
	db.Find(&all)     // SELECT * FROM products (без soft-deleted по умолчанию)
	fmt.Printf("Продукты (%d):\n", len(all))
	for _, p := range all { // p — копия элемента среза
		fmt.Printf("  %s — %.2f\n", p.Name, p.Price)
	}
}

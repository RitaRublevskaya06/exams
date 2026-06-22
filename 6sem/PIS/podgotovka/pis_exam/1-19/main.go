// package main — объявление пакета main: исполняемая программа (не библиотека).
// Компилятор ищет функцию main() как точку входа.
package main

// import — подключение стандартных пакетов из Go SDK.
import (
	"bufio"   // буферизованный ввод/вывод (Reader, Writer, копирование потоков)
	"fmt"     // форматированный вывод: Println, Printf, Sprintf, Errorf
	"os"      // ОС: файлы, директории, аргументы, переменные окружения
	"strings" // функции для string: Contains, ToUpper, Split и т.д.
	"sync"    // WaitGroup, Mutex — синхронизация горутин
	"time"    // Duration, Sleep, Now — время и задержки
)

// task5 — задание 5: базовые типы и константы.
func task5() {
	var integer int = 42        // int — целое со знаком (размер зависит от платформы, обычно 64 бита)
	var boolean bool = true     // bool — логический тип: true или false
	var floatNum float64 = 3.14 // float64 — число с плавающей точкой двойной точности (IEEE 754)
	var text string = "Hello"   // string — неизменяемая последовательность байт (UTF-8)
	const PI = 3.14159          // const — константа времени компиляции, тип выводится как float64

	fmt.Println("=== ЗАДАНИЕ 5: Типы и константы ===") // Println пишет строку + перевод строки \n
	// Printf — форматированный вывод; %d int, %t bool, %.2f float с 2 знаками, %s string
	fmt.Printf("int: %d, bool: %t, float: %.2f, string: %s, const: %.5f\n\n",
		integer, boolean, floatNum, text, PI) // аргументы подставляются в плейсхолдеры по порядку
}

// task6 — задание 6: указатели (хранят адрес переменной в памяти).
func task6() {
	x := 10       // := — краткое объявление: var x int = 10; тип выводится как int
	ptr := &x     // &x — оператор «взять адрес»: ptr имеет тип *int (указатель на int)
	*ptr = 20     // *ptr — разыменование: запись по адресу меняет саму переменную x

	fmt.Println("=== ЗАДАНИЕ 6: Указатели ===")
	// x — значение в памяти; *ptr — то же значение, прочитанное через указатель
	fmt.Printf("Значение x: %d, указатель указывает на: %d\n\n", x, *ptr)
}

// task7 — задание 7: массивы (фиксированная длина, часть типа).
func task7() {
	var arr [3]int = [3]int{1, 2, 3} // [3]int — массив ровно из 3 int; литерал {1,2,3} задаёт элементы
	multi := [2][2]int{{1, 2}, {3, 4}} // массив 2×2: тип включает размеры [2][2]

	fmt.Println("=== ЗАДАНИЕ 7: Массивы ===")
	fmt.Printf("Одномерный: %v\n", arr)   // %v — значение в формате по умолчанию (для слайса/массива — элементы)
	fmt.Printf("Двумерный: %v\n\n", multi) // \n\n — две пустые строки для отступа между заданиями
}

// task8 — задание 8: срезы (slice) — ссылка на подмассив с длиной и ёмкостью.
func task8() {
	slice := []int{1, 2, 3}           // []int — срез: указатель + len + cap; литерал создаёт backing array
	slice = append(slice, 4, 5)       // append может расширить массив и вернуть новый заголовок среза
	subSlice := slice[1:4]            // [low:high] — полуинтервал: индексы 1,2,3 (high не входит)

	fmt.Println("=== ЗАДАНИЕ 8: Срезы ===")
	fmt.Printf("Исходный срез: %v\n", slice)
	fmt.Printf("Подсрез [1:4]: %v\n\n", subSlice) // subSlice разделяет тот же backing array с slice
}

// task9 — задание 9: map — хеш-таблица «ключ → значение».
func task9() {
	ages := map[string]int{ // map[K]V — ключ string, значение int
		"Alice": 25, // литерал map: пары ключ:значение
		"Bob":   30,
	}
	ages["Charlie"] = 35 // вставка/обновление по ключу
	delete(ages, "Bob")  // delete удаляет пару; встроенная функция, не метод

	fmt.Println("=== ЗАДАНИЕ 9: Map ===")
	for name, age := range ages { // range по map: name — ключ, age — значение; порядок случайный
		fmt.Printf("%s: %d лет\n", name, age)
	}
	fmt.Println() // пустая строка
}

// Celsius — именованный тип на базе float64 (не алиас: разные методы можно вешать отдельно).
type Celsius float64

func task10() {
	var temp Celsius = 25.5 // присваивание: float64-литерал приводится к типу Celsius
	fmt.Println("=== ЗАДАНИЕ 10: Пользовательский тип ===")
	fmt.Printf("Температура: %.1f°C\n\n", temp) // %.1f — float с одним знаком после запятой
}

// UserID — алиас типа (= string): тот же набор операций, что у string, другое имя для читаемости.
type UserID = string

func task11() {
	var uid UserID = "user123" // UserID и string взаимозаменяемы без явного приведения
	fmt.Println("=== ЗАДАНИЕ 11: Алиасы ===")
	fmt.Printf("UserID: %s\n\n", uid)
}

// Person — структура: набор полей с именами (агрегат данных).
type Person struct {
	Name string // поле Name типа string
	Age  int    // поле Age типа int
}

// (p Person) — метод с получателем по значению: копия Person, не меняет оригинал снаружи.
func (p Person) Greet() string {
	return "Привет, я " + p.Name // + для string конкатенирует байты/руны в новую строку
}

func task12() {
	p := Person{Name: "Alice", Age: 30} // литерал структуры: именованные поля
	fmt.Println("=== ЗАДАНИЕ 12: Структуры ===")
	fmt.Printf("Структура: %+v\n", p)              // %+v — имя поля + значение
	fmt.Printf("Метод Greet(): %s\n\n", p.Greet()) // вызов метода на значении p
}

// task13 — строки в Go: UTF-8, len() — число байт, не рун.
func task13() {
	s := "Hello, Go!" // двойные кавычки — строка; одинарные 'A' — одна руна
	fmt.Println("=== ЗАДАНИЕ 13: Строки ===")
	fmt.Printf("Длина: %d\n", len(s)) // len(s) — байты, для кириллицы может быть > числа символов
	fmt.Printf("Содержит 'Go': %t\n", strings.Contains(s, "Go")) // Contains ищет подстроку []byte
	fmt.Printf("В верхнем регистре: %s\n", strings.ToUpper(s))    // ToUpper по рунам Unicode
	fmt.Printf("Разделение по пробелу: %v\n\n", strings.Split(s, " ")) // Split → []string
}

// task14 — арифметические и логические операции.
func task14() {
	a, b := 10, 3 // множественное присваивание: a=10, b=3
	fmt.Println("=== ЗАДАНИЕ 14: Операции ===")
	fmt.Printf("Присваивание: a=%d, b=%d\n", a, b)
	fmt.Printf("Бинарные: a+b=%d, a-b=%d, a*b=%d, a/b=%d\n", a+b, a-b, a*b, a/b) // / целочисленное для int
	fmt.Printf("Унарные: ++a=%d, --b=%d\n", a+1, b-1) // в Printf нельзя ++a; показан результат a+1
	fmt.Printf("Логические: (a>b)=%t, (a==b)=%t\n\n", a > b, a == b) // сравнения дают bool
}

// task15 — ветвление if и switch.
func task15() {
	score := 85
	fmt.Println("=== ЗАДАНИЕ 15: if/switch ===")

	if score >= 90 { // if — условие должно быть bool; фигурные скобки обязательны
		fmt.Println("Оценка: A")
	} else if score >= 80 { // else if — цепочка условий
		fmt.Println("Оценка: B")
	} else {
		fmt.Println("Оценка: C")
	}

	switch score { // switch сравнивает score с case (без break — нет проваливания, как в C)
	case 100:
		fmt.Println("Идеально!")
	case 85:
		fmt.Println("Хорошо!")
	default: // default — если ни один case не совпал
		fmt.Println("Нормально")
	}
	fmt.Println()
}

// task16 — циклы; в Go только for (while — это for с одним условием).
func task16() {
	fmt.Println("=== ЗАДАНИЕ 16: Циклы ===")

	fmt.Print("for i:=0; i<5; i++: ") // Print без \n — вывод в одну строку
	for i := 0; i < 5; i++ {          // классический for: init; condition; post
		fmt.Printf("%d ", i) // i живёт только внутри цикла (область видимости блока)
	}

	fmt.Print("\nfor range по слайсу: ")
	nums := []int{1, 2, 3}
	for idx, val := range nums { // range возвращает индекс и копию/значение элемента
		fmt.Printf("[%d]=%d ", idx, val)
	}

	fmt.Print("\nwhile-подобный цикл: ")
	count := 0
	for count < 3 { // только условие — аналог while(count < 3)
		fmt.Printf("%d ", count)
		count++ // count = count + 1
	}
	fmt.Println("\n")
}

// add — обычная функция: параметры a,b типа int, возвращает int.
func add(a, b int) int {
	return a + b // return передаёт значение вызывающему
}

// divide — несколько возвращаемых значений: (результат, ошибка) — идиома Go.
func divide(a, b int) (int, error) {
	if b == 0 {
		return 0, fmt.Errorf("деление на ноль") // fmt.Errorf создаёт error с текстом
	}
	return a / b, nil // nil — нулевое значение для интерфейса error (нет ошибки)
}

// sum — variadic: nums ...int внутри функции это []int.
func sum(nums ...int) int {
	total := 0
	for _, n := range nums { // _ — игнорируем индекс; n — элемент среза
		total += n
	}
	return total
}

func task17() {
	fmt.Println("=== ЗАДАНИЕ 17: Функции ===")
	fmt.Printf("add(5,3)=%d\n", add(5, 3))

	if res, err := divide(10, 2); err == nil { // краткое объявление res, err в if
		fmt.Printf("divide(10,2)=%d\n", res)
	}

	fmt.Printf("sum(1,2,3,4)=%d\n\n", sum(1, 2, 3, 4)) // аргументы собираются в срез внутри sum
}

// worker — функция для горутины; wg *sync.WaitGroup — указатель на счётчик ожидания.
func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done() // defer выполнится при выходе из функции; Done() уменьшает счётчик wg на 1
	fmt.Printf("Воркер %d начал\n", id)
	time.Sleep(500 * time.Millisecond) // Sleep блокирует текущую горутину на 500 мс
	fmt.Printf("Воркер %d закончил\n", id)
}

// task18 — параллельный запуск через go и ожидание через WaitGroup.
func task18() {
	fmt.Println("=== ЗАДАНИЕ 18: Горутины ===")
	var wg sync.WaitGroup // нулевое значение — готовый к использованию счётчик (0)

	for i := 1; i <= 3; i++ {
		wg.Add(1)              // +1 к счётчику перед запуском горутины
		go worker(i, &wg)      // go — запуск worker в отдельной горутине; &wg — адрес wg
	}

	wg.Wait() // блокирует main, пока счётчик не станет 0 (все Done вызваны)
	fmt.Println("Все воркеры завершили работу\n")
}

// task19 — файлы и каталоги через пакет os и bufio.
func task19() {
	fmt.Println("=== ЗАДАНИЕ 19: Работа с файловой системой ===")

	os.MkdirAll("./testdata", 0755) // MkdirAll создаёт путь рекурсивно; 0755 — права rwxr-xr-x (octal)

	data := []byte("Hello, File System!\nSecond line") // []byte — срез байт; строка конвертируется в UTF-8 байты
	err := os.WriteFile("./testdata/output.txt", data, 0644) // WriteFile: путь, данные, права rw-r--r--
	if err != nil { // err != nil — в Go так проверяют ошибки (nil = успех)
		fmt.Printf("Ошибка записи: %v\n", err) // %v для error печатает текст err.Error()
		return // выход из task19 при ошибке
	}
	fmt.Println("Файл создан: ./testdata/output.txt")

	readData, _ := os.ReadFile("./testdata/output.txt") // ReadFile возвращает []byte; _ игнорирует err
	fmt.Printf("Содержимое:\n%s\n", string(readData))   // string([]byte) — интерпретация байт как UTF-8

	src, _ := os.Create("./testdata/source.txt") // Create: открыть на запись, создать если нет, обрезать
	src.WriteString("Source content")            // WriteString пишет string как байты
	src.Close()                                  // Close освобождает дескриптор файла ОС

	dst, _ := os.Create("./testdata/dest.txt")
	src2, _ := os.Open("./testdata/source.txt") // Open — только чтение существующего файла
	bufio.NewReader(src2).WriteTo(dst)          // NewReader буферизует чтение; WriteTo копирует в dst
	src2.Close()
	dst.Close()
	fmt.Println("Файл скопирован: source.txt -> dest.txt")

	entries, _ := os.ReadDir("./testdata") // ReadDir — []DirEntry (имя + метаданные)
	fmt.Println("Содержимое директории testdata:")
	for _, entry := range entries { // _ — индекс не нужен; entry — os.DirEntry (интерфейс)
		fmt.Printf("  - %s (дир: %v)\n", entry.Name(), entry.IsDir()) // Name() string; IsDir() bool
	}
	fmt.Println()
}

// main — точка входа программы; вызывается рантаймом после инициализации пакетов.
func main() {
	fmt.Println("========================================")
	fmt.Println("ЗАДАНИЯ 1-19: ОСНОВЫ GO")
	fmt.Println("========================================\n")

	task5()  // вызов функции задания 5
	task6()
	task7()
	task8()
	task9()
	task10()
	task11()
	task12()
	task13()
	task14()
	task15()
	task16()
	task17()
	task18()
	task19()

	fmt.Println("========================================")
	fmt.Println("ВСЕ ЗАДАНИЯ 1-19 ВЫПОЛНЕНЫ")
	fmt.Println("========================================")
}

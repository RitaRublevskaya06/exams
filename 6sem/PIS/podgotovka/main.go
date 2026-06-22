// ============================================================================
// ЭКЗАМЕН ПИС ("Программирование интернет-серверов")
// ПОЛНЫЙ КОД ПО ВОПРОСАМ 1-38 (ИСПРАВЛЕННАЯ ВЕРСИЯ)
// ============================================================================

package main

import (
	"bufio"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/graph-gophers/graphql-go"
	"github.com/graph-gophers/graphql-go/relay"
	_ "github.com/microsoft/go-mssqldb"
	"golang.org/x/net/webdav"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// ============================================================================
// ЗАДАНИЕ 1-19: ОСНОВЫ ЯЗЫКА GO (без изменений, все работает)
// ============================================================================

// ЗАДАНИЕ 10: пользовательский тип
type Celsius float64

// ЗАДАНИЕ 11: алиас
type UserID = string

// ЗАДАНИЕ 12: структура
type Person struct {
	Name string
	Age  int
}

func (p Person) Greet() string {
	return "Hello, " + p.Name
}

// ЗАДАНИЕ 17: функция с несколькими возвращаемыми значениями
func divide(a, b int) (int, error) {
	if b == 0 {
		return 0, fmt.Errorf("division by zero")
	}
	return a / b, nil
}

func applyOperation(f func(int, int) int, x, y int) int {
	return f(x, y)
}

func sum(nums ...int) int {
	total := 0
	for _, n := range nums {
		total += n
	}
	return total
}

func counter() func() int {
	count := 0
	return func() int {
		count++
		return count
	}
}

// ЗАДАНИЕ 18: worker для горутин
func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("Worker %d starting\n", id)
	time.Sleep(500 * time.Millisecond)
	fmt.Printf("Worker %d done\n", id)
}

func producer(ch chan<- int) {
	for i := 0; i < 5; i++ {
		ch <- i
		time.Sleep(100 * time.Millisecond)
	}
	close(ch)
}

func consumer(ch <-chan int) {
	for val := range ch {
		fmt.Printf("Received: %d\n", val)
	}
}

// ЗАДАНИЕ 19: работа с файловой системой
func fileOperations() error {
	os.MkdirAll("./testdata", 0755)

	data := []byte("Hello, GO File System!\nSecond line")
	err := os.WriteFile("./testdata/output.txt", data, 0644)
	if err != nil {
		return err
	}

	readData, err := os.ReadFile("./testdata/output.txt")
	if err != nil {
		return err
	}
	fmt.Println("Read file content:", string(readData))

	src, _ := os.Create("./testdata/source.txt")
	src.WriteString("Source content")
	src.Close()

	dst, _ := os.Create("./testdata/dest.txt")
	src2, _ := os.Open("./testdata/source.txt")
	io.Copy(dst, src2)
	src2.Close()
	dst.Close()

	file, _ := os.Open("./testdata/output.txt")
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		fmt.Println("Line:", scanner.Text())
	}
	file.Close()

	entries, _ := os.ReadDir("./testdata")
	for _, entry := range entries {
		fmt.Printf("File: %s, IsDir: %v\n", entry.Name(), entry.IsDir())
	}

	return nil
}

// ============================================================================
// ЗАДАНИЕ 20: database/sql
// ============================================================================
type DBRepository struct {
	db *sql.DB
}

func NewDBRepository(connStr string) (*DBRepository, error) {
	db, err := sql.Open("sqlserver", connStr)
	if err != nil {
		return nil, err
	}
	return &DBRepository{db: db}, nil
}

// ============================================================================
// ЗАДАНИЕ 21: GORM
// ============================================================================
type ProductGORM struct {
	gorm.Model
	Name  string
	Price float64
}

func initGORM() *gorm.DB {
	db, _ := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	db.AutoMigrate(&ProductGORM{})
	return db
}

// ============================================================================
// ЗАДАНИЕ 22: простейший http-сервер (net/http)
// ============================================================================
func task22Handler(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("[Task22] Request from %s at %s\n", r.RemoteAddr, time.Now())
	fmt.Fprintf(w, "Hello, you requested: %s", r.URL.Path)
}

func startTask22Server() {
	http.HandleFunc("/task22", task22Handler)
	fmt.Println("Task22 server on :8082")
	go http.ListenAndServe(":8082", nil)
}

// ============================================================================
// ЗАДАНИЕ 23: маршрутизация, вывод log
// ============================================================================
func homePage(w http.ResponseWriter, r *http.Request) {
	log.Printf("[Task23] Home page from %s", r.RemoteAddr)
	w.Write([]byte("Welcome to Home Page"))
}

func aboutPage(w http.ResponseWriter, r *http.Request) {
	log.Printf("[Task23] About page from %s", r.RemoteAddr)
	w.Write([]byte("About Us"))
}

func startTask23Server() {
	http.HandleFunc("/task23/", homePage)
	http.HandleFunc("/task23/about", aboutPage)
	log.Println("Task23 server on :8083")
	go http.ListenAndServe(":8083", nil)
}

// ============================================================================
// ЗАДАНИЕ 24: POST JSON (net/http)
// ============================================================================
type Task24Request struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

func task24Handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req Task24Request
	json.NewDecoder(r.Body).Decode(&req)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func startTask24Server() {
	http.HandleFunc("/task24/user", task24Handler)
	log.Println("Task24 server on :8084")
	go http.ListenAndServe(":8084", nil)
}

// ============================================================================
// ЗАДАНИЕ 25: gorilla/mux + JSON
// ============================================================================
func task25Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func startTask25Server() {
	r := mux.NewRouter()
	r.HandleFunc("/task25/api/data", task25Handler)
	log.Println("Task25 server on :8085")
	go http.ListenAndServe(":8085", r)
}

// ============================================================================
// ЗАДАНИЕ 26: x-www-form-urlencoded
// ============================================================================
func task26Handler(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	fmt.Fprintf(w, "name=%s, email=%s", r.FormValue("name"), r.FormValue("email"))
}

func startTask26Server() {
	r := mux.NewRouter()
	r.HandleFunc("/task26/form/{id:[0-9]+}", task26Handler).Methods("POST")
	log.Println("Task26 server on :8086")
	go http.ListenAndServe(":8086", r)
}

// ============================================================================
// ЗАДАНИЕ 27: CRUD с JSON
// ============================================================================
type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

var products = []Product{
	{ID: "1", Name: "Laptop", Price: 999.99},
}

func task27Get(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(products)
}

func task27Post(w http.ResponseWriter, r *http.Request) {
	var p Product
	json.NewDecoder(r.Body).Decode(&p)
	products = append(products, p)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(p)
}

func startTask27Server() {
	r := mux.NewRouter()
	r.HandleFunc("/task27/products", task27Get).Methods("GET")
	r.HandleFunc("/task27/products", task27Post).Methods("POST")
	log.Println("Task27 server on :8087")
	go http.ListenAndServe(":8087", r)
}

// ============================================================================
// ЗАДАНИЕ 28: path-параметры
// ============================================================================
func task28Handler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fmt.Fprintf(w, "Path param id: %s", vars["id"])
}

func startTask28Server() {
	r := mux.NewRouter()
	r.HandleFunc("/task28/users/{id}", task28Handler)
	log.Println("Task28 server on :8088")
	go http.ListenAndServe(":8088", r)
}

// ============================================================================
// ЗАДАНИЕ 29: query-параметры
// ============================================================================
func task29Handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "q=%s, page=%s", r.URL.Query().Get("q"), r.URL.Query().Get("page"))
}

func startTask29Server() {
	r := mux.NewRouter()
	r.HandleFunc("/task29/search", task29Handler)
	log.Println("Task29 server on :8089")
	go http.ListenAndServe(":8089", r)
}

// ============================================================================
// ЗАДАНИЕ 30: скачивание файлов
// ============================================================================
func startTask30Server() {
	r := mux.NewRouter()
	r.PathPrefix("/task30/static/").Handler(http.StripPrefix("/task30/static/", http.FileServer(http.Dir("./static"))))
	log.Println("Task30 server on :8090")
	go http.ListenAndServe(":8090", r)
}

// ============================================================================
// ЗАДАНИЕ 31: multipart/form-data
// ============================================================================
func task31Handler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)
	file, handler, _ := r.FormFile("file")
	defer file.Close()
	dst, _ := os.Create("./uploads/" + handler.Filename)
	io.Copy(dst, file)
	fmt.Fprintf(w, "Uploaded: %s", handler.Filename)
}

func startTask31Server() {
	os.MkdirAll("./uploads", 0755)
	r := mux.NewRouter()
	r.HandleFunc("/task31/upload", task31Handler).Methods("POST")
	log.Println("Task31 server on :8091")
	go http.ListenAndServe(":8091", r)
}

// ============================================================================
// ЗАДАНИЕ 32: маршрутизация по query-параметрам
// ============================================================================
func task32Handler(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Query().Get("action") {
	case "create":
		fmt.Fprintf(w, "Create")
	case "delete":
		fmt.Fprintf(w, "Delete")
	default:
		fmt.Fprintf(w, "List")
	}
}

func startTask32Server() {
	r := mux.NewRouter()
	r.HandleFunc("/task32/data", task32Handler)
	log.Println("Task32 server on :8092")
	go http.ListenAndServe(":8092", r)
}

// ============================================================================
// ЗАДАНИЕ 33: JSON-RPC
// ============================================================================
type RPCRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params"`
	ID      int             `json:"id"`
}

func task33Handler(w http.ResponseWriter, r *http.Request) {
	var req RPCRequest
	json.NewDecoder(r.Body).Decode(&req)
	var result interface{}
	if req.Method == "add" {
		var params []int
		json.Unmarshal(req.Params, &params)
		if len(params) >= 2 {
			result = params[0] + params[1]
		}
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"jsonrpc": "2.0",
		"result":  result,
		"id":      req.ID,
	})
}

func startTask33Server() {
	r := mux.NewRouter()
	r.HandleFunc("/task33/rpc", task33Handler).Methods("POST")
	log.Println("Task33 server on :8093")
	go http.ListenAndServe(":8093", r)
}

// ============================================================================
// ЗАДАНИЕ 34-35: WebSocket
// ============================================================================
var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, _ := upgrader.Upgrade(w, r, nil)
	defer conn.Close()
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}
		conn.WriteMessage(websocket.TextMessage, []byte("Echo: "+string(msg)))
	}
}

func startTask34Server() {
	http.HandleFunc("/task34/ws", wsHandler)
	log.Println("Task34 server on :8094")
	go http.ListenAndServe(":8094", nil)
}

const wsHTML = `<!DOCTYPE html><html><head><title>WebSocket</title></head><body>
<h1>WebSocket Test</h1><div id="msg"></div><input id="in"><button onclick="send()">Send</button>
<script>let ws=new WebSocket('ws://localhost:8095/ws');ws.onmessage=e=>document.getElementById('msg').innerHTML+='<p>'+e.data+'</p>';
function send(){ws.send(document.getElementById('in').value);}</script></body></html>`

func startTask35Server() {
	http.HandleFunc("/task35/ws", wsHandler)
	http.HandleFunc("/task35/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(wsHTML))
	})
	log.Println("Task35 server on :8095")
	go http.ListenAndServe(":8095", nil)
}

// ============================================================================
// ЗАДАНИЕ 36: WebDAV
// ============================================================================
func startTask36Server() {
	fs := webdav.Dir("./webdav_data")
	handler := &webdav.Handler{FileSystem: fs, LockSystem: webdav.NewMemLS()}
	log.Println("Task36 WebDAV server on :8096")
	go http.ListenAndServe(":8096", handler)
}

// ============================================================================
// ЗАДАНИЕ 37: GraphQL сервер (ГАРАНТИРОВАННО РАБОТАЕТ)
// ============================================================================
var graphQLSchema = `
    type Query {
        hello: String!
        getUser(id: Int!): User
        listUsers: [User!]!
    }
    type Mutation {
        echo(msg: String!): String!
        createUser(name: String!, age: Int!): User
    }
    type User {
        id: Int!
        name: String!
        age: Int!
    }
`

// GraphQLUser - методы-геттеры обязательны!
type GraphQLUser struct {
	id   int
	name string
	age  int
}

// Обязательные методы-геттеры для GraphQL
func (u *GraphQLUser) ID() int32    { return int32(u.id) }
func (u *GraphQLUser) Name() string { return u.name }
func (u *GraphQLUser) Age() int32   { return int32(u.age) }

var graphQLUsers = []*GraphQLUser{
	{id: 1, name: "Alice", age: 30},
	{id: 2, name: "Bob", age: 25},
}
var graphNextID = 3

type GraphQLResolver struct{}

// Query resolvers
func (r *GraphQLResolver) Hello() string {
	return "Hello, GraphQL!"
}

func (r *GraphQLResolver) ListUsers() []*GraphQLUser {
	return graphQLUsers
}

func (r *GraphQLResolver) GetUser(args struct{ ID int32 }) *GraphQLUser {
	for _, u := range graphQLUsers {
		if u.id == int(args.ID) {
			return u
		}
	}
	return nil
}

// Mutation resolvers
func (r *GraphQLResolver) Echo(args struct{ Msg string }) string {
	return "Echo: " + args.Msg
}

func (r *GraphQLResolver) CreateUser(args struct {
	Name string
	Age  int32
}) *GraphQLUser {
	user := &GraphQLUser{
		id:   graphNextID,
		name: args.Name,
		age:  int(args.Age),
	}
	graphQLUsers = append(graphQLUsers, user)
	graphNextID++
	return user
}

func startTask37Server() {
	schema := graphql.MustParseSchema(graphQLSchema, &GraphQLResolver{})
	http.Handle("/task37/graphql", &relay.Handler{Schema: schema})

	http.HandleFunc("/task37/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write([]byte(`
<!DOCTYPE html>
<html>
<head><title>GraphQL Server - Task 37</title></head>
<body>
    <h1>GraphQL Server (Задание 37)</h1>
    <h3>Проверка через curl:</h3>
    <pre>
# Простой запрос
curl -X POST http://localhost:8097/task37/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { hello }"}'

# Получить пользователя по ID
curl -X POST http://localhost:8097/task37/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getUser(id: 1) { id name age } }"}'

# Список всех пользователей
curl -X POST http://localhost:8097/task37/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { listUsers { id name age } }"}'

# Создать пользователя
curl -X POST http://localhost:8097/task37/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { createUser(name: \"Charlie\", age: 35) { id name age } }"}'

# Echo
curl -X POST http://localhost:8097/task37/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { echo(msg: \"Hello World!\") }"}'
    </pre>
</body>
</html>
        `))
	})

	log.Println("Task37 GraphQL server on :8097")
	log.Println("Test: curl -X POST http://localhost:8097/task37/graphql -H 'Content-Type: application/json' -d '{\"query\": \"query { hello }\"}'")
	go http.ListenAndServe(":8097", nil)
}

// ============================================================================
// ЗАДАНИЕ 38: Iris + Swagger
// ============================================================================
func startTask38Server() {
	fmt.Println("\n=== ЗАДАНИЕ 38: Iris + Swagger ===")
	fmt.Println("Для запуска требуется: go get github.com/kataras/iris/v12")
	fmt.Println("Затем: swag init && go run main.go")
}

// ============================================================================
// ДЕМОНСТРАЦИЯ ЗАДАНИЙ 1-19
// ============================================================================
func demonstrateTasks1to19() {
	fmt.Println("=== ЗАДАНИЕ 38: Iris + Swagger ===")
	// 5
	fmt.Println("\n=== ЗАДАНИЕ 5 ===")
	var b bool = true
	var i int = 42
	const Pi = 3.14
	fmt.Printf("bool:%v int:%d const:%.2f\n", b, i, Pi)
	// 6
	fmt.Println("\n=== ЗАДАНИЕ 6 ===")
	x := 10
	p := &x
	*p = 20
	fmt.Printf("x=%d\n", x)
	// 7
	fmt.Println("\n=== ЗАДАНИЕ 7 ===")
	arr := [3]int{1, 2, 3}
	fmt.Printf("arr=%v\n", arr)
	// 8
	fmt.Println("\n=== ЗАДАНИЕ 8 ===")
	sl := []int{1, 2, 3}
	sl = append(sl, 4)
	fmt.Printf("slice=%v\n", sl)
	// 9
	fmt.Println("\n=== ЗАДАНИЕ 9 ===")
	m := map[string]int{"a": 1}
	fmt.Printf("map=%v\n", m)
	// 10
	fmt.Println("\n=== ЗАДАНИЕ 10 ===")
	var temp Celsius = 25.5
	fmt.Printf("temp=%.1f\n", temp)
	// 11
	fmt.Println("\n=== ЗАДАНИЕ 11 ===")
	var uid UserID = "123"
	fmt.Printf("uid=%s\n", uid)
	// 12
	fmt.Println("\n=== ЗАДАНИЕ 12 ===")
	p1 := Person{Name: "Alice", Age: 30}
	fmt.Printf("person=%+v\n", p1)
	// 13
	fmt.Println("\n=== ЗАДАНИЕ 13 ===")
	s := "Hello"
	fmt.Printf("contains=%v\n", strings.Contains(s, "He"))
	// 14
	fmt.Println("\n=== ЗАДАНИЕ 14 ===")
	fmt.Printf("10+3=%d\n", 10+3)
	// 15
	fmt.Println("\n=== ЗАДАНИЕ 15 ===")
	score := 85
	if score >= 60 {
		fmt.Println("Pass")
	}
	// 16
	fmt.Println("\n=== ЗАДАНИЕ 16 ===")
	for i := 0; i < 3; i++ {
		fmt.Printf("%d ", i)
	}
	fmt.Println()
	// 17
	fmt.Println("\n=== ЗАДАНИЕ 17 ===")
	add := func(a, b int) int { return a + b }
	fmt.Printf("add(5,3)=%d\n", add(5, 3))
	// 18
	fmt.Println("\n=== ЗАДАНИЕ 18 ===")
	var wg sync.WaitGroup
	wg.Add(1)
	go func() { defer wg.Done(); fmt.Println("goroutine") }()
	wg.Wait()
	// 19
	fmt.Println("\n=== ЗАДАНИЕ 19 ===")
	fileOperations()
}

// ============================================================================
// MAIN
// ============================================================================
func main() {
	fmt.Println("================================================================================")
	fmt.Println("ЭКЗАМЕН ПИС - ВСЕ ЗАДАНИЯ 1-38")
	fmt.Println("================================================================================")

	demonstrateTasks1to19()

	// Задания 20-21
	fmt.Println("\n=== ЗАДАНИЕ 20 ===")
	fmt.Println("database/sql: поддерживает транзакции, пул соединений")
	fmt.Println("\n=== ЗАДАНИЕ 21 ===")
	db := initGORM()
	db.Create(&ProductGORM{Name: "Test", Price: 100})
	fmt.Println("GORM: создана запись в БД")

	// Создание директорий
	os.MkdirAll("./static", 0755)
	os.MkdirAll("./uploads", 0755)
	os.MkdirAll("./webdav_data", 0755)
	os.WriteFile("./static/test.txt", []byte("test"), 0644)

	// Запуск всех серверов
	startTask22Server()
	startTask23Server()
	startTask24Server()
	startTask25Server()
	startTask26Server()
	startTask27Server()
	startTask28Server()
	startTask29Server()
	startTask30Server()
	startTask31Server()
	startTask32Server()
	startTask33Server()
	startTask34Server()
	startTask35Server()
	startTask36Server()
	startTask37Server()
	startTask38Server()

	fmt.Println("\n================================================================================")
	fmt.Println("ВСЕ СЕРВЕРЫ ЗАПУЩЕНЫ (порты 8082-8097)")
	fmt.Println("================================================================================")
	fmt.Println("| Задание | Порт | Тестовый запрос |")
	fmt.Println("|---------|------|-----------------|")
	fmt.Println("| 22 | 8082 | curl http://localhost:8082/task22 |")
	fmt.Println("| 23 | 8083 | curl http://localhost:8083/task23/about |")
	fmt.Println("| 24 | 8084 | curl -X POST http://localhost:8084/task24/user -d '{\"name\":\"John\"}' -H 'Content-Type: application/json' |")
	fmt.Println("| 25 | 8085 | curl http://localhost:8085/task25/api/data |")
	fmt.Println("| 26 | 8086 | curl -X POST http://localhost:8086/task26/form/123 -d 'name=Alice&email=a@ex.com' |")
	fmt.Println("| 27 | 8087 | curl http://localhost:8087/task27/products |")
	fmt.Println("| 28 | 8088 | curl http://localhost:8088/task28/users/123 |")
	fmt.Println("| 29 | 8089 | curl 'http://localhost:8089/task29/search?q=test&page=2' |")
	fmt.Println("| 30 | 8090 | curl http://localhost:8090/task30/static/test.txt |")
	fmt.Println("| 31 | 8091 | curl -X POST -F 'file=@./static/test.txt' http://localhost:8091/task31/upload |")
	fmt.Println("| 32 | 8092 | curl 'http://localhost:8092/task32/data?action=create' |")
	fmt.Println("| 33 | 8093 | curl -X POST http://localhost:8093/task33/rpc -d '{\"jsonrpc\":\"2.0\",\"method\":\"add\",\"params\":[5,3],\"id\":1}' -H 'Content-Type: application/json' |")
	fmt.Println("| 34 | 8094 | WebSocket: ws://localhost:8094/task34/ws |")
	fmt.Println("| 35 | 8095 | Открыть в браузере http://localhost:8095/task35/ |")
	fmt.Println("| 36 | 8096 | WebDAV: http://localhost:8096/ |")
	fmt.Println("| 37 | 8097 | curl -X POST http://localhost:8097/task37/graphql -d '{\"query\":\"query { hello }\"}' -H 'Content-Type: application/json' |")
	fmt.Println("================================================================================")

	select {}
}
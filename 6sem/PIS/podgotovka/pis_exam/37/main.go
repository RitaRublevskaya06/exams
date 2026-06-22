// package main — задание 37: GraphQL-сервер (схема + resolvers + HTTP).
package main

import (
	"log"
	"net/http"
	"strconv" // Itoa — int → string для ID

	"github.com/graph-gophers/graphql-go"       // парсинг schema, выполнение запросов
	"github.com/graph-gophers/graphql-go/relay"   // HTTP-обёртка: POST /graphql, JSON body
)

// schema — SDL (Schema Definition Language): типы Query, Mutation, User.
const schema = `
	type Query {
		hello: String!
		user(id: ID!): User
		users: [User!]!
	}
	type Mutation {
		createUser(name: String!, age: Int!): User!
		updateUser(id: ID!, name: String, age: Int): User!
	}
	type User {
		id: ID!
		name: String!
		age: Int!
	}
`

// User — Go-структура; graphql-go сопоставляет поля с типом User в schema.
type User struct {
	ID   string `json:"id"`   // GraphQL ID — в примере строка
	Name string `json:"name"`
	Age  int32  `json:"age"`  // Int в GraphQL → int32 в Go
}

// users — map ключ ID → User; in-memory БД.
var users = map[string]User{
	"1": {ID: "1", Name: "Alice", Age: 25},
	"2": {ID: "2", Name: "Bob", Age: 30},
}
var nextID = 3 // счётчик для новых пользователей

// Resolver — пустая struct; методы с (r *Resolver) — resolvers для полей Query/Mutation.
type Resolver struct{}

// Hello — resolver поля Query.hello → String!.
func (r *Resolver) Hello() string {
	return "Hello, GraphQL!"
}

// User — resolver Query.user(id); args — анонимная struct с полем ID из аргумента GraphQL.
func (r *Resolver) User(args struct{ ID string }) *User {
	if user, ok := users[args.ID]; ok { // map lookup
		return &user // указатель на копию для nullable *User
	}
	return nil // GraphQL null, если не найден
}

// Users — resolver Query.users → список *User.
func (r *Resolver) Users() []*User {
	result := make([]*User, 0, len(users)) // срез указателей с ёмкостью len(users)
	for id := range users {               // id — ключ map (строка)
		u := users[id]                    // копия User из map
		result = append(result, &u)
	}
	return result
}

// CreateUser — mutation createUser(name, age).
func (r *Resolver) CreateUser(args struct {
	Name string
	Age  int32
}) *User {
	id := strconv.Itoa(nextID) // "3", "4", ...
	user := User{ID: id, Name: args.Name, Age: args.Age}
	users[id] = user
	nextID++
	return &user
}

// UpdateUser — mutation updateUser; Name/Age *T — опциональные поля (nullable в GraphQL).
func (r *Resolver) UpdateUser(args struct {
	ID   string
	Name *string // nil = поле не передали
	Age  *int32
}) *User {
	user, exists := users[args.ID]
	if !exists {
		return nil
	}
	if args.Name != nil {
		user.Name = *args.Name // разыменование указателя
	}
	if args.Age != nil {
		user.Age = *args.Age
	}
	users[args.ID] = user
	return &user
}

func main() {
	// MustParseSchema: парсит schema; &Resolver{} — корень дерева resolvers; panic при ошибке.
	s := graphql.MustParseSchema(schema, &Resolver{})

	// relay.Handler: принимает POST {"query":"..."} на /graphql.
	http.Handle("/graphql", &relay.Handler{Schema: s})

	// HTML+JS playground: fetch('/graphql') с JSON; внутри — textarea, кнопки, примеры Postman.
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(`
<!DOCTYPE html>
<html>
<head>
    <title>GraphQL Playground</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        .container { display: flex; gap: 20px; }
        .query-box { flex: 1; }
        textarea { width: 100%; height: 200px; font-family: monospace; }
        button { padding: 10px; margin-top: 10px; cursor: pointer; }
        .result { flex: 1; border: 1px solid #ccc; padding: 10px; white-space: pre-wrap; }
        pre { background: #f4f4f4; padding: 10px; }
    </style>
</head>
<body>
    <h1>GraphQL Server (Задание 37)</h1>
    <div class="container">
        <div class="query-box">
            <h3>Query/Mutation:</h3>
            <textarea id="query">{
  hello
  users {
    id
    name
    age
  }
}</textarea>
            <br>
            <button onclick="sendQuery()">Выполнить</button>
            <button onclick="sendQuery('mutation { createUser(name: \"Charlie\", age: 35) { id name age } }')">
                Создать пользователя
            </button>
        </div>
        <div class="result">
            <h3>Результат:</h3>
            <pre id="result">Ждет запроса...</pre>
        </div>
    </div>
    <hr>
    <h3>Примеры запросов для Postman:</h3>
    <pre>
Endpoint: POST http://localhost:8097/graphql
Headers: Content-Type: application/json

1. Простой запрос:
{
    "query": "query { hello }"
}

2. Получить пользователя:
{
    "query": "query { user(id: \"1\") { id name age } }"
}

3. Всех пользователей:
{
    "query": "query { users { id name age } }"
}

4. Создать пользователя:
{
    "query": "mutation { createUser(name: \"David\", age: 40) { id name age } }"
}
    </pre>

    <script>
        async function sendQuery(customQuery) {
            const query = customQuery || document.getElementById('query').value;
            try {
                const response = await fetch('/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: query })
                });
                const result = await response.json();
                document.getElementById('result').innerHTML = JSON.stringify(result, null, 2);
            } catch (err) {
                document.getElementById('result').innerHTML = 'Error: ' + err.message;
            }
        }
    </script>
</body>
</html>
		`)) // конец raw string; в JS: sendQuery → fetch POST, body JSON.stringify({query})
	})

	log.Println("=== ЗАДАНИЕ 37: GraphQL сервер ===")
	log.Println("Сервер запущен на :8097")
	log.Println("GraphQL endpoint: http://localhost:8097/graphql")
	log.Println("HTML интерфейс: http://localhost:8097")
	log.Println("\nДля проверки через Postman:")
	log.Println("  POST http://localhost:8097/graphql")
	log.Println(`  Body: {"query": "query { hello }"}`) // обратные кавычки — строка с " внутри

	http.ListenAndServe(":8097", nil) // DefaultServeMux: / и /graphql
}

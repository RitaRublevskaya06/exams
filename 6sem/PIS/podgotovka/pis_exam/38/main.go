// package main — задание 38: REST API на фреймворке Iris.
package main

import (
	"github.com/kataras/iris/v12" // веб-фреймворк: Context, Party, маршруты, JSON
)

// User — модель для JSON API; теги json — имена полей в теле запроса/ответа.
type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Age  int    `json:"age"`
}

// users — хранилище в памяти (срез структур).
var users = []User{
	{ID: 1, Name: "Alice", Age: 25},
	{ID: 2, Name: "Bob", Age: 30},
}

// findUser ищет по ID; возвращает пользователя, индекс в срезе, found.
func findUser(id int) (User, int, bool) {
	for i, u := range users {
		if u.ID == id {
			return u, i, true
		}
	}
	return User{}, -1, false // нулевая структура, -1, false
}

// notFound — единый ответ 404 JSON.
func notFound(ctx iris.Context) {
	ctx.StatusCode(404)                      // HTTP-статус в заголовке ответа
	ctx.JSON(iris.Map{"error": "User not found"}) // iris.Map = map[string]interface{}
}

// @Summary — комментарии для swag (генерация Swagger); на работу кода не влияют.
// @Router /users [get]
func GetUsers(ctx iris.Context) {
	ctx.JSON(users) // сериализует срез в application/json
}

// @Router /users/{id} [get]
func GetUser(ctx iris.Context) {
	id, _ := ctx.Params().GetInt("id") // path-параметр {id:int} → int
	if u, _, ok := findUser(id); ok {
		ctx.JSON(u)
		return
	}
	notFound(ctx)
}

// @Router /users [post]
func CreateUser(ctx iris.Context) {
	var u User
	if err := ctx.ReadJSON(&u); err != nil { // тело POST → struct
		ctx.StatusCode(400)
		ctx.JSON(iris.Map{"error": err.Error()})
		return
	}
	u.ID = len(users) + 1 // простой авто-ID
	users = append(users, u)
	ctx.StatusCode(201)
	ctx.JSON(u)
}

// @Router /users/{id} [put]
func UpdateUser(ctx iris.Context) {
	id, _ := ctx.Params().GetInt("id")
	if _, i, ok := findUser(id); ok {
		var u User
		if err := ctx.ReadJSON(&u); err != nil {
			ctx.StatusCode(400)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}
		u.ID = id           // сохраняем id из URL
		users[i] = u        // замена элемента среза
		ctx.JSON(u)
		return
	}
	notFound(ctx)
}

// @Router /users/{id} [delete]
func DeleteUser(ctx iris.Context) {
	id, _ := ctx.Params().GetInt("id")
	if _, i, ok := findUser(id); ok {
		users = append(users[:i], users[i+1:]...) // удаление среза без этого элемента
		ctx.StatusCode(204) // 204 No Content — тело пустое
		return
	}
	notFound(ctx)
}

func main() {
	app := iris.New()           // *iris.Application — экземпляр приложения
	api := app.Party("/api")    // группа маршрутов с префиксом /api
	api.Get("/users", GetUsers)
	api.Get("/users/{id:int}", GetUser) // {id:int} — только целое
	api.Post("/users", CreateUser)
	api.Put("/users/{id:int}", UpdateUser)
	api.Delete("/users/{id:int}", DeleteUser)

	app.Get("/", func(ctx iris.Context) { // анонимный handler — справка
		ctx.HTML(`<h1>REST API (Iris)</h1>
<p>GET/POST <code>/api/users</code>, GET/PUT/DELETE <code>/api/users/{id}</code></p>
<p>Порт: <code>8098</code></p>`) // HTML в ответе
	})

	app.Listen(":8098") // блокирует; слушает TCP :8098
}

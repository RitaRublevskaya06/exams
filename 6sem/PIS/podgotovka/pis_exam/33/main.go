// package main — задание 33: JSON-RPC 2.0 поверх HTTP POST.
package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

// JSONRPCRequest — формат запроса JSON-RPC 2.0.
type JSONRPCRequest struct {
	JSONRPC string          `json:"jsonrpc"` // всегда "2.0"
	Method  string          `json:"method"`  // имя метода: add, concat
	Params  json.RawMessage `json:"params"`  // сырой JSON параметров (отложенный разбор)
	ID      int             `json:"id"`      // id клиента для сопоставления ответа
}

// JSONRPCResponse — ответ: либо result, либо error (omitempty скрывает пустые поля в JSON).
type JSONRPCResponse struct {
	JSONRPC string      `json:"jsonrpc"`
	Result  interface{} `json:"result,omitempty"` // любой JSON-тип (число, строка...)
	Error   *RPCError   `json:"error,omitempty"`  // указатель: nil → поле не в JSON
	ID      int         `json:"id"`
}

type RPCError struct {
	Code    int    `json:"code"`    // код по спецификации JSON-RPC
	Message string `json:"message"` // текст ошибки
}

type AddParams struct {
	A int `json:"a"`
	B int `json:"b"`
}

type ConcatParams struct {
	S1 string `json:"s1"`
	S2 string `json:"s2"`
}

func rpcHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		json.NewEncoder(w).Encode(JSONRPCResponse{
			JSONRPC: "2.0",
			Error:   &RPCError{Code: -32600, Message: "Invalid Request"},
			ID:      0,
		})
		return
	}

	var req JSONRPCRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		json.NewEncoder(w).Encode(JSONRPCResponse{
			JSONRPC: "2.0",
			Error:   &RPCError{Code: -32700, Message: "Parse error"},
			ID:      0,
		})
		return
	}

	var result interface{} // итог вычисления метода
	var rpcErr *RPCError   // ошибка RPC или nil

	switch req.Method {
	case "add":
		var params AddParams
		// Unmarshal из json.RawMessage в структуру params.
		if err := json.Unmarshal(req.Params, &params); err != nil {
			rpcErr = &RPCError{Code: -32602, Message: "Invalid params"}
		} else {
			result = params.A + params.B // int попадёт в interface{}
		}

	case "concat":
		var params ConcatParams
		if err := json.Unmarshal(req.Params, &params); err != nil {
			rpcErr = &RPCError{Code: -32602, Message: "Invalid params"}
		} else {
			result = params.S1 + params.S2 // конкатенация строк
		}

	default:
		rpcErr = &RPCError{Code: -32601, Message: "Method not found"}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(JSONRPCResponse{
		JSONRPC: "2.0",
		Result:  result,
		Error:   rpcErr,
		ID:      req.ID, // эхо id из запроса
	})
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/rpc", rpcHandler).Methods("POST")

	log.Println("Сервер запущен на :8093")
	log.Println("Методы: add, concat")
	log.Println("Проверка: curl -X POST http://localhost:8093/rpc -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"add\",\"params\":{\"a\":5,\"b\":3},\"id\":1}'")

	http.ListenAndServe(":8093", r)
}

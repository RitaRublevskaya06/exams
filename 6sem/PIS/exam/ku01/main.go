package main

import (
	"fmt"
)

func task5() {
	var integer int = 42
	var boolean bool = true
	var floatNum float64 = 3.14
	var text string = "Hello"
	const PI = 3.14159

	fmt.Println("=== ЗАДАНИЕ 5: Типы и константы ===")
	fmt.Printf("int: %d, bool: %t, float: %.2f, string: %s, const: %.5f\n\n",
		integer, boolean, floatNum, text, PI)
}

func main() {
	task5()
}

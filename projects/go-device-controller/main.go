//go:build !js
// +build !js

package main

import "go-device-controller/internal/pkg/server"

func main() {
	server.Run()
}

package utils

import (
	"net"
	"sync"
)

var freePortMutex = sync.Mutex{}

func ListenUDPFreePort() (*net.UDPConn, int, error) {
	addr, err := net.ResolveUDPAddr("udp", "localhost:0")
	if err != nil {
		return nil, 0, err
	}
	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		return nil, 0, err
	}
	return conn, conn.LocalAddr().(*net.UDPAddr).Port, nil
}

func ListenTCPFreePort() (*net.TCPListener, int, error, *sync.Mutex) {
	freePortMutex.Lock()
	addr, err := net.ResolveTCPAddr("tcp", "localhost:0")
	if err != nil {
		return nil, 0, err, &freePortMutex
	}
	conn, err := net.ListenTCP("tcp", addr)
	if err != nil {
		return nil, 0, err, &freePortMutex
	}
	return conn, conn.Addr().(*net.TCPAddr).Port, nil, &freePortMutex
}

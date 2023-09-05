package utils

import (
	"context"
	"errors"
	"io"
	"net"
	"strings"
	"sync"
	"syscall"

	"github.com/gorilla/websocket"
)

var freePortMutex = sync.Mutex{}

func ListenUDPFreePort() (*net.UDPConn, int, error) {
	addr, err := net.ResolveUDPAddr("udp", "127.0.0.1:0")
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
	addr, err := net.ResolveTCPAddr("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, 0, err, &freePortMutex
	}
	conn, err := net.ListenTCP("tcp", addr)
	if err != nil {
		return nil, 0, err, &freePortMutex
	}
	return conn, conn.Addr().(*net.TCPAddr).Port, nil, &freePortMutex
}

func IsNetConnClosedErr(err error) bool {
	switch {
	case
		errors.Is(err, net.ErrClosed),
		errors.Is(err, io.EOF),
		errors.Is(err, syscall.EPIPE):
		websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure)
		return true
	default:
		return false
	}
}

func IsNetTimeoutErr(err error) bool {
	netErr, ok := err.(net.Error)
	if ok {
		return netErr.Timeout()
	}
	errStr := err.Error()
	if strings.Contains(errStr, "i/o timeout") {
		return true
	}

	switch {
	case
		errors.Is(err, context.DeadlineExceeded),
		errors.Is(err, syscall.ETIMEDOUT):
		return true
	default:
		return false
	}
}

// i/o timeout

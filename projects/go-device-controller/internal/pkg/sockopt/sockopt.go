//go:build darwin || linux


package sockopt

import (
	"fmt"
	"syscall"

	"golang.org/x/sys/unix"
)

func ReusePort(network, address string, conn syscall.RawConn) error {
	return conn.Control(func(descriptor uintptr) {
		if errReusePort := unix.SetsockoptInt(int(descriptor), unix.SOL_SOCKET, unix.SO_REUSEPORT, 1); errReusePort != nil {
			fmt.Printf("reuse port error: %v\n", errReusePort)
			return
		}
	})
}

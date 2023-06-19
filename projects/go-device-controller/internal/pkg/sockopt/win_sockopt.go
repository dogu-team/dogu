//go:build windows

package sockopt

import "syscall"

func ReusePort(network, address string, conn syscall.RawConn) error {
	return nil
}

package server

import (
	"fmt"
	"net"
	"os"
	"time"

	log "go-device-controller/internal/pkg/log"

	"go.uber.org/zap"
)

var (
	tickTime          time.Duration = 1000 * time.Millisecond
	connectionTimeout time.Duration = 10000 * time.Millisecond
	tryCount          int           = 10
)

func goCheckDeviceServer(port uint32) {
	// set Timer for check device server
	ticker := time.NewTicker(tickTime)
	failCount := 0
	go func() {
		for range ticker.C {
			conn, err := net.DialTimeout("tcp", fmt.Sprintf("127.0.0.1:%d", port), connectionTimeout)
			if err != nil {
				failCount += 1
				log.Inst.Debug("deviceserver connection fail", zap.Int("count", failCount))
				if failCount > tryCount {
					log.Inst.Error("deviceserver connection error", zap.Error(err))
					os.Exit(1)
				}
				continue
			}
			failCount = 0
			conn.Close()
		}
	}()
}

package tests

import (
	"go-device-controller/internal/pkg/server"
	"testing"
	"time"

	log "go-device-controller/internal/pkg/log"

	"go.uber.org/zap"
)

func TestRun(t *testing.T) {
	srv := server.RunDetach()
	count := 300
	for i := 0; i < count; i++ {
		time.Sleep(time.Second * 1)
		log.Inst.Info("countdown", zap.Int("count", count-i))
	}
	srv.Stop()
}

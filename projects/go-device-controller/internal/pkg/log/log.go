package log

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Inst *zap.Logger

func Start() {
	// https://codewithmukesh.com/blog/structured-logging-in-golang-with-zap/
	config := zap.NewProductionEncoderConfig()
	config.EncodeTime = zapcore.ISO8601TimeEncoder
	encoder := zapcore.NewConsoleEncoder(config)
	writer := zapcore.AddSync(os.Stdout)
	defaultLogLevel := zapcore.DebugLevel
	core := zapcore.NewTee(
		zapcore.NewCore(encoder, writer, defaultLogLevel),
	)
	Inst = zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))
}

func Stop() {
	Inst.Sync()
}

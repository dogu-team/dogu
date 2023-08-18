package utils

import (
	"bufio"
	"io"
	"os"
	"os/exec"

	log "go-device-controller/internal/pkg/log"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func Execute(name string, arg ...string) (*exec.Cmd, error) {
	log.Inst.Info("Executing: ", zap.String("name", name), zap.Strings("args", arg))
	command := exec.Command(name, arg...)
	command.Env = os.Environ()

	stdout, err := command.StdoutPipe()
	if err != nil {
		log.Inst.Error("utils.Execute", zap.Error(err))
		return nil, err
	}
	stdoutReader := bufio.NewReader(stdout)

	stderr, err := command.StderrPipe()
	if err != nil {
		log.Inst.Error("utils.Execute", zap.Error(err))
		return nil, err
	}
	stderrReader := bufio.NewReader(stderr)

	if err := command.Start(); err != nil {
		log.Inst.Error("utils.Execute", zap.Error(err))
		return nil, err
	}

	go handleReader(name, zapcore.InfoLevel, stdoutReader)
	go handleReader(name, zapcore.ErrorLevel, stderrReader)

	return command, nil
}

func handleReader(name string, level zapcore.Level, reader *bufio.Reader) {
	for {
		str, err := reader.ReadString('\n')
		if len(str) == 0 && err != nil {
			if err == io.EOF {
				break
			}
			return
		}
		log.Inst.Log(level, str)

		if err != nil {
			if err == io.EOF {
				break
			}
			return
		}
	}

	return
}

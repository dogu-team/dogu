package utils

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"os/exec"

	log "go-device-controller/internal/pkg/log"

	"go.uber.org/zap"
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

	go handleReader(stdoutReader)
	go handleReader(stderrReader)

	return command, nil
}

func handleReader(reader *bufio.Reader) error {
	for {
		str, err := reader.ReadString('\n')
		if len(str) == 0 && err != nil {
			if err == io.EOF {
				break
			}
			return err
		}

		fmt.Print(str)

		if err != nil {
			if err == io.EOF {
				break
			}
			return err
		}
	}

	return nil
}

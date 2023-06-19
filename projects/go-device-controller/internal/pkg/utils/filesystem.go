package utils

import (
	"errors"
	"os"
	"path/filepath"
)

func OpenFile(name string, flag int, perm os.FileMode) (*os.File, error) {
	if 0 == len(name) {
		return nil, errors.New("file name is empty")
	}
	if name[0] == '~' {
		home, err := os.UserHomeDir()
		if err != nil {
			return nil, err
		}
		name = filepath.Join(home, name[1:])
	}
	parentDirPath := filepath.Dir(name)
	err := os.MkdirAll(parentDirPath, 0o755)
	if err != nil {
		return nil, err
	}
	file, err := os.OpenFile(name, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0o600)
	if err != nil {
		return nil, err
	}
	return file, nil
}

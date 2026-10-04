package storage

import (
	"bytes"
	"crypto/rand"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

type Local struct {
	Directory string
}

func NewLocal(directory string) Local {
	return Local{Directory: directory}
}

// Save menyimpan isi io.Reader ke storage dengan nama acak.
func (local Local) Save(source io.Reader, extension string) (string, error) {
	content, err := io.ReadAll(source)
	if err != nil {
		return "", err
	}
	return local.SaveBytes(content, extension)
}

// SaveBytes menyimpan []byte ke storage dengan nama acak.
func (local Local) SaveBytes(content []byte, extension string) (string, error) {
	if err := os.MkdirAll(local.Directory, 0755); err != nil {
		return "", err
	}

	var randomNameBytes [16]byte
	if _, err := rand.Read(randomNameBytes[:]); err != nil {
		return "", err
	}

	storedPath := filepath.Join(local.Directory, fmt.Sprintf("%x%s", randomNameBytes, extension))
	storedFile, err := os.Create(storedPath)
	if err != nil {
		return "", err
	}

	if _, err := io.Copy(storedFile, bytes.NewReader(content)); err != nil {
		_ = storedFile.Close()
		_ = os.Remove(storedPath)
		return "", err
	}
	if err := storedFile.Close(); err != nil {
		_ = os.Remove(storedPath)
		return "", err
	}

	return storedPath, nil
}

func (local Local) Remove(path string) error {
	return os.Remove(path)
}

package tests

import (
	"bufio"
	"bytes"
	"testing"

	"go-device-controller/internal/pkg/utils"

	"github.com/stretchr/testify/assert"
)

func TestSizePrefixedRecvQueue(t *testing.T) {
	q := utils.NewSizePrefixedRecvQueue()
	for i := 0; i < 10; i++ {
		reader := bufio.NewReader(bytes.NewReader([]byte{0x0A, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A}))
		q.Push(reader)
		assert.True(t, q.Has())
		data, err := q.Pop()
		assert.Nil(t, err)
		assert.Equal(t, []byte{0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A}, data)
		assert.False(t, q.Has())
	}
}

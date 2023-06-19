package utils

import (
	"bufio"
	"errors"
	"reflect"
	"unsafe"
)

const GROW_SIZE = 65536

type SizePrefixedRecvQueue struct {
	slice []byte // https://go.dev/blog/slices-intro
}

func NewSizePrefixedRecvQueue() *SizePrefixedRecvQueue {
	sprq := SizePrefixedRecvQueue{}
	sprq.slice = make([]byte, 0, GROW_SIZE)
	return &sprq
}

func (q *SizePrefixedRecvQueue) Push(reader *bufio.Reader) error {
	qEnd := len(q.slice)
	if cap(q.slice) == len(q.slice) {
		q.slice = append(q.slice, make([]byte, GROW_SIZE)...)
	}
	readSlice := q.slice[qEnd:cap(q.slice)]
	n, err := reader.Read(readSlice)
	if err != nil {
		return err
	}
	q.slice = q.slice[:qEnd+n]
	return nil
}

func (q *SizePrefixedRecvQueue) PushBytes(data []byte) {
	q.slice = append(q.slice, data...)
}

func (q *SizePrefixedRecvQueue) Has() bool {
	// https://kokes.github.io/blog/2019/03/19/deserialising-ints-from-bytes.html
	sh := (*reflect.SliceHeader)(unsafe.Pointer(&q.slice))
	size := *(*uint32)(unsafe.Pointer(sh.Data))
	return uint32(len(q.slice)) >= 4+size
}

func (q *SizePrefixedRecvQueue) Pop() ([]byte, error) {
	if !q.Has() {
		return nil, errors.New("SizePrefixedRecvQueue.Pop no data")
	}
	sh := (*reflect.SliceHeader)(unsafe.Pointer(&q.slice))
	size := *(*uint32)(unsafe.Pointer(sh.Data))
	data := q.slice[4 : 4+size]
	q.slice = q.slice[4+size:]
	return data, nil
}

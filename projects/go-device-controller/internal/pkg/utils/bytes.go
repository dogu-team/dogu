package utils

import "encoding/binary"

func WriteUint32LE(bytes []byte, v uint32) {
	binary.LittleEndian.PutUint32(bytes, v)
}

func PrefixBytesWithSize(bytes []byte) []byte {
	prefixed := make([]byte, 4+len(bytes))
	WriteUint32LE(prefixed, uint32(len(bytes)))
	copy(prefixed[4:], bytes)
	return prefixed
}

func SpliteBytes(bytes []byte, maxChunkSize int) [][]byte {
	var splited [][]byte
	for len(bytes) > maxChunkSize {
		splited = append(splited, bytes[:maxChunkSize])
		bytes = bytes[maxChunkSize:]
	}
	if len(bytes) > 0 {
		splited = append(splited, bytes)
	}
	return splited
}

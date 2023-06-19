package structs

type DatachannelContext struct {
	SendFunc func([]byte)
}

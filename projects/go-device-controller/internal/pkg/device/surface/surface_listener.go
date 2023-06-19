package surface

type SurfaceListener interface {
	GetSurfaceListenerType() string
	OnSurface(timeStamp uint32, Data []byte)
	OnRTPBytes(timeStamp uint32, Data []byte)
	OnRemove()
}

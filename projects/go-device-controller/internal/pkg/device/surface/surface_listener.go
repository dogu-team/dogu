package surface

type SurfaceListener interface {
	GetId() int
	SetId(id int)
	GetSurfaceListenerType() string
	OnSurface(timeStamp uint32, Data []byte)
	OnRTPBytes(timeStamp uint32, Data []byte)
	OnRemove()
}

package surface

type SurfaceListenerType string

type SurfaceListener interface {
	GetId() int
	SetId(id int)
	GetSurfaceListenerType() SurfaceListenerType
	OnSurface(timeStamp uint32, Data []byte)
	OnRTPBytes(timeStamp uint32, Data []byte)
	OnRemove()
}

func (s SurfaceListenerType) String() string {
	return string(s)
}

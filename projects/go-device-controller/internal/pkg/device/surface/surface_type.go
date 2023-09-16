package surface

type SurfaceType string

const (
	SurfaceTypeScreen        SurfaceType = "screen"
	SurfaceTypeProcessScreen SurfaceType = "process_screen"
)

func NewSurfaceType(screenId ScreenId, pid Pid) SurfaceType {
	if pid > 0 {
		return SurfaceTypeProcessScreen
	}
	return SurfaceTypeScreen
}

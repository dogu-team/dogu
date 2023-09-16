package surface

import (
	"sync"

	"go-device-controller/types/protocol/generated/proto/outer"
)

type SurfaceFactory func(*Surface, SurfaceType, ScreenId, Pid)

type Surfaces struct {
	serial         string
	platform       outer.Platform
	surfaceFactory SurfaceFactory
	surfaceList    []*Surface
	surfacesMutex  sync.RWMutex
}

func NewSurfaces(target *Surfaces, serial string, platform outer.Platform, surfaceFactory SurfaceFactory) {
	target.serial = serial
	target.platform = platform
	target.surfaceFactory = surfaceFactory
	target.surfaceList = make([]*Surface, 0)
	target.surfacesMutex = sync.RWMutex{}
}

func (ss *Surfaces) GetOrCreateSurface(surfaceType SurfaceType, screenId ScreenId, pid Pid) *Surface {
	target := ss.findSurface(surfaceType, screenId, pid)
	if target != nil {
		return target
	}

	ss.surfacesMutex.Lock()
	defer ss.surfacesMutex.Unlock()

	surface := &Surface{}
	ss.surfaceFactory(surface, surfaceType, screenId, pid)
	ss.surfaceList = append(ss.surfaceList, surface)
	return surface
}

func (ss *Surfaces) RemoveSurfaceListener(listener SurfaceListener) bool {
	ss.surfacesMutex.Lock()
	defer ss.surfacesMutex.Unlock()

	isFound := false
	for i, surface := range ss.surfaceList {
		if surface.RemoveListener(listener) {
			isFound = true
			if !surface.IsListenerExist() {
				ss.surfaceList = append(ss.surfaceList[:i], ss.surfaceList[i+1:]...)
			}
			break
		}
	}
	return isFound
}

func (ss *Surfaces) Remove() {
	ss.surfacesMutex.Lock()
	defer ss.surfacesMutex.Unlock()

	for _, surface := range ss.surfaceList {
		surface.RemoveAllListeners()
	}

	ss.surfaceList = make([]*Surface, 0)
}

func (ss *Surfaces) FindListeners(listenerType SurfaceListenerType) []SurfaceListener {
	ss.surfacesMutex.RLock()
	defer ss.surfacesMutex.RUnlock()

	var listeners []SurfaceListener
	for _, surface := range ss.surfaceList {
		listeners = append(listeners, surface.FindListeners(listenerType)...)
	}
	return listeners
}

func (ss *Surfaces) GetStatus(surfaceType SurfaceType, screenId ScreenId, pid Pid) *SurfaceStatus {
	target := ss.findSurface(surfaceType, screenId, pid)
	if target != nil {
		ret := target.GetStatus()
		return &ret
	}
	return nil
}

func (ss *Surfaces) Profiles() []SurfaceProfile {
	ss.surfacesMutex.RLock()
	defer ss.surfacesMutex.RUnlock()

	var profiles []SurfaceProfile
	for _, surface := range ss.surfaceList {
		profiles = append(profiles, surface.Profile)
	}
	return profiles
}

func (ss *Surfaces) findSurface(surfaceType SurfaceType, screenId ScreenId, pid Pid) *Surface {
	ss.surfacesMutex.RLock()
	defer ss.surfacesMutex.RUnlock()

	for _, surface := range ss.surfaceList {
		if surface.IsEqual(ss.serial, surfaceType, screenId, pid) {
			return surface
		}
	}
	return nil
}

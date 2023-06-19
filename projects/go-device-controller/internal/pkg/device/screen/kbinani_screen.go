//go:build !linux
// +build !linux

package screen

import (
	"image"

	"github.com/kbinani/screenshot"
	"github.com/pion/mediadevices"
)

type kbinaniScreen struct {
	displayIndex int
	doneCh       chan struct{}
}

var _ mediadevices.VideoSource = &kbinaniScreen{}

func NewKibinaniScreen(displayIndex int) *kbinaniScreen {
	s := kbinaniScreen{
		displayIndex: displayIndex,
	}
	return &s
}

func (s *kbinaniScreen) ID() string {
	return "KbinaniScreen"
}

func (s *kbinaniScreen) Open() error {
	// s.doneCh = make(chan struct{})
	return nil
}

func (s *kbinaniScreen) Close() error {
	// close(s.doneCh)
	return nil
}

func (s *kbinaniScreen) Read() (img image.Image, release func(), err error) {
	// select {
	// case <-s.doneCh:
	// 	return nil, nil, io.EOF
	// default:
	// }

	img, err = screenshot.CaptureDisplay(s.displayIndex)
	release = func() {}
	return
}

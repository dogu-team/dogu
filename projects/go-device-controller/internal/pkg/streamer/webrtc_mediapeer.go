package streamer

import (
	"encoding/base64"

	"go-device-controller/types/protocol/generated/proto/outer"
	"go-device-controller/types/protocol/generated/proto/outer/streaming"

	log "go-device-controller/internal/pkg/log"

	"github.com/pion/interceptor"
	"github.com/pion/webrtc/v3"
	"go.uber.org/zap"
)

type webRTCPeer struct {
	peerConn   *webrtc.PeerConnection
	videoTrack *webrtc.TrackLocalStaticRTP
	listener   webRTCPeerListener
	platform   outer.Platform
}

type webRTCPeerListener interface {
	onTrickle(*streaming.StreamingAnswer)
	onWebRTCPeerConnected()
	onWebRTCPeerDisconnected()
	onDataChannel(d *webrtc.DataChannel)
}

func newWebRTCMediaPeer(w *webRTCPeer, listener webRTCPeerListener, platform outer.Platform) {
	w.listener = listener
	w.platform = platform
}

func (peer *webRTCPeer) start(param *streaming.StreamingOffer_StartStreaming) {
	var err error
	log.Inst.Info("webRTCMediaPeer.start ")
	peerDesc := param.StartStreaming.PeerDescription

	m := &webrtc.MediaEngine{}
	if err := m.RegisterCodec(getVideoParametersByPlatform(peer.platform), webrtc.RTPCodecTypeVideo); err != nil {
		peer.listener.onTrickle(createStreamingError(outer.Code_CODE_WEBRTC_PEERCONNECTION_FAILED, err))
		return
	}

	// Create a InterceptorRegistry. This is the user configurable RTP/RTCP Pipeline.
	// This provides NACKs, RTCP Reports and other features. If you use `webrtc.NewPeerConnection`
	// this is enabled by default. If you are manually managing You MUST create a InterceptorRegistry
	// for each PeerConnection.
	i := &interceptor.Registry{}

	// Use the default set of Interceptors
	if err := webrtc.RegisterDefaultInterceptors(m, i); err != nil {
		peer.listener.onTrickle(createStreamingError(outer.Code_CODE_WEBRTC_PEERCONNECTION_FAILED, err))
		return
	}
	api := webrtc.NewAPI(webrtc.WithMediaEngine(m), webrtc.WithInterceptorRegistry(i))
	// Prepare the configuration
	config := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{
					// https://gist.github.com/zziuni/3741933 STUN server list
					"stun:stun.l.google.com:19302",
					"stun:stun1.l.google.com:19302",
					"stun:stun2.l.google.com:19302",
					"stun:stun3.l.google.com:19302",
					"stun:stun4.l.google.com:19302",
				},
			},
			{
				URLs: []string{
					param.StartStreaming.TurnServerUrl,
				},
				Username:       param.StartStreaming.TurnServerUsername,
				Credential:     param.StartStreaming.TurnServerPassword,
				CredentialType: webrtc.ICECredentialTypePassword,
			},
		},
	}
	// Create a new RTCPeerConnection
	peer.peerConn, err = api.NewPeerConnection(config)
	if err != nil {
		peer.listener.onTrickle(createStreamingError(outer.Code_CODE_WEBRTC_PEERCONNECTION_FAILED, err))
		return
	}

	peerConn := peer.peerConn

	// Create a video track
	// clockRate, https://lmtools.com/content/rtp-timestamp-calculation
	peer.videoTrack, err = webrtc.NewTrackLocalStaticRTP(getCapabilityByPlatform(peer.platform), "video", "pion")
	if err != nil {
		peer.listener.onTrickle(createStreamingError(outer.Code_CODE_WEBRTC_PEERCONNECTION_FAILED, err))
		return
	}
	rtpSender, err := peerConn.AddTrack(peer.videoTrack)
	if err != nil {
		peer.listener.onTrickle(createStreamingError(outer.Code_CODE_WEBRTC_PEERCONNECTION_FAILED, err))
		return
	}
	peer.peerConn.OnDataChannel(func(d *webrtc.DataChannel) {
		peer.listener.onDataChannel(d)
	})

	// Read incoming RTCP packets
	// Before these packets are returned they are processed by interceptors. For things
	// like NACK this needs to be called.
	go func() {
		rtcpBuf := make([]byte, 1500)
		for {
			if _, _, rtcpErr := rtpSender.Read(rtcpBuf); rtcpErr != nil {
				return
			}
		}
	}()

	// Set the handler for ICE connection state
	// This will notify you when the peer has connected/disconnected
	peerConn.OnICEConnectionStateChange(func(connectionState webrtc.ICEConnectionState) {
		log.Inst.Info("Connection State has changed", zap.String("state", connectionState.String()))

		switch connectionState {
		case webrtc.ICEConnectionStateConnected:
			go peer.listener.onWebRTCPeerConnected()
		case webrtc.ICEConnectionStateFailed:
			if closeErr := peerConn.Close(); closeErr != nil {
				log.Inst.Error("webRTCMediaPeer.start peerConn.Close error", zap.Error(closeErr))
			}
		// Wait until PeerConnection has had no network activity for 30 seconds or another failure. It may be reconnected using an ICE Restart.
		// Use webrtc.PeerConnectionStateDisconnected if you are interested in detecting faster timeout.
		// Note that the PeerConnection may come back from PeerConnectionStateDisconnected.
		case webrtc.ICEConnectionStateDisconnected, webrtc.ICEConnectionStateClosed:
			peer.listener.onWebRTCPeerDisconnected()
		}
	})

	// Set the handler for Peer connection state
	// This will notify you when the peer has connected/disconnected
	peerConn.OnConnectionStateChange(func(s webrtc.PeerConnectionState) {
		log.Inst.Info("Peer Connection State has changed", zap.String("state", s.String()))

		// ! handle on OnICEConnectionStateChange
	})

	peerConn.OnICECandidate(func(candidate *webrtc.ICECandidate) {
		if candidate == nil {
			log.Inst.Warn("webRTCMediaPeer.start OnICECandidate candidate nil")
			return
		}
		candidateJson := candidate.ToJSON()
		if len(candidateJson.Candidate) == 0 {
			log.Inst.Warn("webRTCMediaPeer.start OnICECandidate candidate empty")
			return
		}

		sdpMid := ""
		if candidateJson.SDPMid != nil {
			sdpMid = *candidateJson.SDPMid
		}

		userFrag := ""
		if candidateJson.UsernameFragment != nil {
			userFrag = *candidateJson.UsernameFragment
		}
		peer.listener.onTrickle(&streaming.StreamingAnswer{
			Value: &streaming.StreamingAnswer_IceCandidate{
				IceCandidate: &streaming.ProtoRTCIceCandidateInit{
					Candidate:        candidateJson.Candidate,
					SdpMid:           sdpMid,
					SdpMlineIndex:    int32(*candidateJson.SDPMLineIndex),
					UsernameFragment: userFrag,
				},
			},
		})
		log.Inst.Debug("webRTCMediaPeer.start OnICECandidate ", zap.String("candidate", candidate.String()))
	})

	// Wait for the offer to be pasted
	offer := webrtc.SessionDescription{}
	sdp, err := base64.StdEncoding.DecodeString(peerDesc.SdpBase64)
	if err != nil {
		peer.listener.onTrickle(createStreamingError(outer.Code_CODE_WEBRTC_PEERCONNECTION_FAILED, err))
		return
	}
	offer.SDP = string(sdp[:])
	offer.Type = webrtc.SDPType(peerDesc.Type.Number())

	// Set the remote SessionDescription
	log.Inst.Debug("webRTCMediaPeer.start SetRemoteDescription")
	if err = peerConn.SetRemoteDescription(offer); err != nil {
		peer.listener.onTrickle(createStreamingError(outer.Code_CODE_WEBRTC_PEERCONNECTION_FAILED, err))
		return
	}

	// Create answer
	log.Inst.Debug("webRTCMediaPeer.start CreateAnswer")
	answer, err := peerConn.CreateAnswer(nil)
	if err != nil {
		peer.listener.onTrickle(createStreamingError(outer.Code_CODE_WEBRTC_PEERCONNECTION_FAILED, err))
		return
	}

	// gatherComplete := webrtc.GatheringCompletePromise(peerConn)

	// Sets the LocalDescription, and starts our UDP listeners
	log.Inst.Debug("webRTCMediaPeer.start SetLocalDescription")
	if err = peerConn.SetLocalDescription(answer); err != nil {
		peer.listener.onTrickle(createStreamingError(outer.Code_CODE_WEBRTC_PEERCONNECTION_FAILED, err))
		return
	}

	// Block until ICE Gathering is complete, disabling trickle ICE
	// we do this because we only can exchange one signaling message
	// in a production application you should exchange ICE Candidates via OnICECandidate
	// <-gatherComplete
	log.Inst.Debug("webRTCMediaPeer.start gatherComplete")

	// Output the answer in base64 so we can paste it in browser
	localDesc := peerConn.LocalDescription()

	peer.listener.onTrickle(&streaming.StreamingAnswer{
		Value: &streaming.StreamingAnswer_PeerDescription{
			PeerDescription: &streaming.ProtoRTCPeerDescription{
				SdpBase64: base64.StdEncoding.EncodeToString([]byte(localDesc.SDP)),
				Type:      convertSdpTypeFromGoToProto(localDesc.Type),
			},
		},
	})
}

func (peer *webRTCPeer) stop() error {
	if closeErr := peer.peerConn.Close(); closeErr != nil {
		log.Inst.Error("webRTCMediaPeer.stop peerConn.Close error", zap.Error(closeErr))
		return closeErr
	}
	return nil
}

func createStreamingError(code outer.Code, err error) *streaming.StreamingAnswer {
	return &streaming.StreamingAnswer{
		Value: &streaming.StreamingAnswer_ErrorResult{
			ErrorResult: &outer.ErrorResult{
				Code:    code,
				Message: err.Error(),
			},
		},
	}
}

package relayer

import (
	"net/http"
	"sync"
	"time"

	log "go-device-controller/internal/pkg/log"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

type WebsocketRelayer struct {
	serial        string
	getUrlFunc    func() string
	onRecvMessage func([]byte)
	conn          *websocket.Conn
	mutex         sync.Mutex
}

func NewWebsocketRelayer(r *WebsocketRelayer, serial string, getUrlFunc func() string, onRecvMessage func([]byte)) {
	r.serial = serial
	r.getUrlFunc = getUrlFunc
	r.onRecvMessage = onRecvMessage
	go r.startRecvLoop()
}

func (r *WebsocketRelayer) SendMessage(data []byte) error {
	var err error
	serverUrl := r.getUrlFunc()

	if nil == r.conn {
		conn, _, err := reconnect(r.getUrlFunc, 9999, 1)
		if nil == conn {
			log.Inst.Error("WebsocketRelayer.WriteMessage error", zap.String("serial", r.serial), zap.String("url", serverUrl), zap.Error(err))
			r.conn = nil
			return err
		}
		r.conn = conn
	}

	err = r.conn.WriteMessage(websocket.BinaryMessage, data)
	if err != nil {
		log.Inst.Error("WebsocketRelayer.WriteMessage error", zap.String("serial", r.serial), zap.String("url", serverUrl), zap.Error(err))
		r.conn = nil
		return err
	}
	return nil
}

func (r *WebsocketRelayer) startRecvLoop() {
	for {
		if nil == r.conn {
			time.Sleep(time.Second * 1)
			continue
		}

		_, bytes, err := r.conn.ReadMessage()
		if err != nil {
			log.Inst.Error("WebsocketRelayer.ReadMessage error", zap.String("serial", r.serial), zap.Error(err))
			r.conn = nil
			continue
		}

		r.onRecvMessage(bytes)
	}
}

func (r *WebsocketRelayer) Close() {
	if nil != r.conn {
		r.conn.Close()
	}
	r.conn = nil
}

func reconnect(getUrlFunc func() string, retryCount int, sleepSec int) (*websocket.Conn, *http.Response, error) {
	// reconnect loop
	count := 0
	for {
		serverUrl := getUrlFunc()
		conn, resp, err := websocket.DefaultDialer.Dial(serverUrl, nil)
		if err != nil {
			if count >= retryCount {
				return nil, resp, err
			}
			log.Inst.Info("WebsocketRelayer.reconnect", zap.String("url", serverUrl), zap.Int("retry", count))
			time.Sleep(time.Second * time.Duration(sleepSec))
			count += 1
			continue
		}
		return conn, resp, nil
	}
}

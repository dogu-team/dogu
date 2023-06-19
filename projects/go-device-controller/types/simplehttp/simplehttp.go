package simplehttp

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
)

const (
	RESPONSE_CODE_UNSPECIFIED_VALUE  = 0
	RESPONSE_CODE_UNSPECIFIED_STRING = "RESPONSE_CODE_UNSPECIFIED"
)

type ResponseCode int32

func NewResponseCode(code int32) ResponseCode {
	return ResponseCode(code)
}

func NewResponseCodeUnspecified() ResponseCode {
	return NewResponseCode(RESPONSE_CODE_UNSPECIFIED_VALUE)
}

func (r ResponseCode) Value() int32 {
	return int32(r)
}

func (r ResponseCode) String() string {
	if r.Unspecified() {
		return RESPONSE_CODE_UNSPECIFIED_STRING
	} else {
		return http.StatusText(int(r))
	}
}

// NOTE(henry): 응답 코드와 문자열을 에러 객체로 단순 치환한다.
// 미초기화, 성공, 실패를 의미하는 것이 아니다.
func (r ResponseCode) Error() error {
	return fmt.Errorf("%d: %s", r.Value(), r.String())
}

func (r ResponseCode) Unspecified() bool {
	return r == RESPONSE_CODE_UNSPECIFIED_VALUE
}

func (r ResponseCode) Success() bool {
	return 200 <= r.Value() && r.Value() < 300
}

func (r ResponseCode) NotFound() bool {
	return r.Value() == 404
}

type ResponseBody = []byte

type Response struct {
	Code ResponseCode
	Body ResponseBody
}

func newRequest(ctx context.Context, method string, url string, headers map[string]string, body []byte) (*http.Request, error) {
	if body != nil {
		return http.NewRequestWithContext(ctx, method, url, bytes.NewBuffer(body))
	}
	return http.NewRequestWithContext(ctx, method, url, nil)
}

func Request(ctx context.Context, method string, url string, headers map[string]string, body []byte) (*Response, error) {
	req, err := newRequest(ctx, method, url, headers, body)
	if err != nil {
		return nil, err
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	bodyBuf, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	simpleResp := &Response{
		Code: NewResponseCode(int32(resp.StatusCode)),
		Body: bodyBuf,
	}
	return simpleResp, nil
}

func Get(ctx context.Context, url string, headers map[string]string) (*Response, error) {
	return Request(ctx, http.MethodGet, url, headers, nil)
}

func Post(ctx context.Context, url string, headers map[string]string, body []byte) (*Response, error) {
	return Request(ctx, http.MethodPost, url, headers, body)
}

func Put(ctx context.Context, url string, headers map[string]string, body []byte) (*Response, error) {
	return Request(ctx, http.MethodPut, url, headers, body)
}

func Patch(ctx context.Context, url string, headers map[string]string, body []byte) (*Response, error) {
	return Request(ctx, http.MethodPatch, url, headers, body)
}

func Delete(ctx context.Context, url string, headers map[string]string) (*Response, error) {
	return Request(ctx, http.MethodDelete, url, headers, nil)
}

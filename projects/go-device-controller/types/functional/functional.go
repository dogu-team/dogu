package functional

func Map[T any, U any](src []T, f func(T) U) []U {
	if src == nil {
		return nil
	}
	dst := make([]U, len(src))
	for i, v := range src {
		dst[i] = f(v)
	}
	return dst
}

func Filter[T any](src []T, f func(T) bool) []T {
	if src == nil {
		return nil
	}
	dst := make([]T, 0, len(src))
	for _, v := range src {
		if f(v) {
			dst = append(dst, v)
		}
	}
	return dst
}

func Foldl[T any, U any](src []T, init U, f func(U, T) U) U {
	dst := init
	for _, v := range src {
		dst = f(dst, v)
	}
	return dst
}

func Foldr[T any, U any](src []T, init U, f func(T, U) U) U {
	dst := init
	for i := len(src) - 1; i >= 0; i-- {
		dst = f(src[i], dst)
	}
	return dst
}

func Any[T any](src []T, f func(T) bool) bool {
	if src == nil {
		return false
	}
	for _, v := range src {
		if f(v) {
			return true
		}
	}
	return false
}

func All[T any](src []T, f func(T) bool) bool {
	if src == nil {
		return false
	}
	for _, v := range src {
		if !f(v) {
			return false
		}
	}
	return true
}

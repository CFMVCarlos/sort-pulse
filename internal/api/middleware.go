package api

import (
	"log"
	"net/http"
)

// WithRecovery is a middleware that recovers from panics anywhere in the request chain
// and writes a standardized JSON 500 error response instead of exposing stack traces.
func WithRecovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("panic recovered: %v", err)
				sendJSONError(w, "Internal Server Error", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

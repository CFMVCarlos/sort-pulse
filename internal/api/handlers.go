package api

import (
	"encoding/json"
	"net/http"

	"sortpulse/internal/sorter"
)

// APIError represents a standardized JSON error response.
type APIError struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Code    int    `json:"code"`
}

// sendJSONError writes a standardized JSON error response.
func sendJSONError(w http.ResponseWriter, message string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(APIError{
		Status:  "error",
		Message: message,
		Code:    code,
	})
}

// HandleAlgorithms returns a list of all registered sorting algorithms.
func HandleAlgorithms(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	metas := sorter.List()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metas)
}

// SortRequest defines the JSON payload accepted by HandleSort.
type SortRequest struct {
	Algorithm string `json:"algorithm"`
	Array     []int  `json:"array"`
}

// HandleSort executes a sort using the specified algorithm and input array.
func HandleSort(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Limit request payload to 1MB to guard against DoS/OOM
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	var req SortRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid JSON payload or body too large", http.StatusBadRequest)
		return
	}

	if len(req.Array) == 0 {
		sendJSONError(w, "Array cannot be empty", http.StatusBadRequest)
		return
	}

	if len(req.Array) > 500 {
		sendJSONError(w, "Array is too large (max 500 items)", http.StatusBadRequest)
		return
	}

	for _, v := range req.Array {
		if v < -100000 || v > 100000 {
			sendJSONError(w, "Array values must be within [-100000, 100000]", http.StatusBadRequest)
			return
		}
	}

	s, ok := sorter.Get(req.Algorithm)
	if !ok {
		sendJSONError(w, "Unknown algorithm", http.StatusBadRequest)
		return
	}

	trace := s.Sort(req.Array)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trace)
}

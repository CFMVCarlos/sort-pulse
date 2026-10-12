package main

import (
	"flag"
	"fmt"
	"io"
	"io/fs"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"sortpulse/frontend"
	"sortpulse/internal/api"
)

func main() {
	port := flag.Int("port", 8080, "Port to run the HTTP server on")
	flag.Parse()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/algorithms", api.HandleAlgorithms)
	mux.HandleFunc("POST /api/sort", api.HandleSort)

	// Serve frontend
	distFS, err := frontend.DistFS()
	if err != nil {
		slog.Error("Failed to sub embedded frontend filesystem", "error", err)
		os.Exit(1)
	}

	// Custom handler for serving static files with SPA fallback
	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		// Clean the path
		path := r.URL.Path
		if path == "/" {
			path = "index.html"
		} else {
			path = strings.TrimPrefix(path, "/")
		}

		// Check if file exists in the embedded FS
		_, err := fs.Stat(distFS, path)
		if os.IsNotExist(err) {
			// SPA fallback: serve index.html if file not found
			file, err := distFS.Open("index.html")
			if err != nil {
				http.Error(w, "index.html not found", http.StatusInternalServerError)
				return
			}
			defer file.Close()

			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			http.ServeContent(w, r, "index.html", time.Time{}, file.(io.ReadSeeker))
			return
		}

		// Serve the static file
		http.FileServer(http.FS(distFS)).ServeHTTP(w, r)
	})

	// Wrap mux with middlewares (Recovery -> CORS -> mux)
	handler := api.WithRecovery(api.WithCORS(mux))

	addr := fmt.Sprintf(":%d", *port)
	slog.Info("Starting server", "addr", addr)

	srv := &http.Server{
		Addr:              addr,
		Handler:           handler,
		ReadHeaderTimeout: 3 * time.Second,
		ReadTimeout:       5 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		slog.Error("Server failed to start", "error", err)
		os.Exit(1)
	}
}

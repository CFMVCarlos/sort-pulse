.PHONY: all build run test lint clean

all: build

build:
	@echo "==> Installing frontend dependencies..."
	npm --prefix frontend install
	@echo "==> Building frontend..."
	npm --prefix frontend run build
	@echo "==> Building Go binary..."
	go build -o sortpulse ./server
	@echo "==> Build complete! Run ./sortpulse to start the server."

run: build
	./sortpulse

test:
	go test -v ./...

lint:
	npm --prefix frontend run lint

clean:
	rm -f sortpulse
	rm -rf frontend/dist

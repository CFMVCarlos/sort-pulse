#!/bin/bash
set -e

echo "==> Installing frontend dependencies..."
npm --prefix frontend install

echo "==> Building frontend..."
npm --prefix frontend run build

echo "==> Building Go binary..."
go build -o sortpulse ./server

echo "==> Build complete! Run ./sortpulse to start the server."

<div align="center">

# ⚡ SortPulse

**Interactive, high-performance sorting algorithm visualization lab**

[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8?style=for-the-badge&logo=go)](https://golang.org)
[![React Version](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Linter](https://img.shields.io/badge/Linter-Oxlint-orange?style=for-the-badge&logo=oxc)](https://oxc.rs)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

*An algorithmic observatory and interactive playground built for [Boot.dev](https://boot.dev).*

<br />

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/sortpulse-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="docs/images/sortpulse-light.png">
  <img alt="SortPulse Interactive Algorithm Visualizer" src="docs/images/sortpulse-dark.png" width="100%" />
</picture>

</div>

---

## 🎯 Overview & Features

**SortPulse** is an interactive, full-stack sorting visualizer engineered for algorithmic clarity and sub-millisecond execution analysis. The backend sorting engine is written in Go, recording deterministic execution traces across 22 distinct sorting algorithms. Traces are streamed to a high-speed React + HTML5 Canvas frontend that renders bar animations at 60 FPS while synthesizing real-time auditory frequencies via the Web Audio API.

- 🚀 **High-Performance Go Engine**: Algorithms generate deterministic step-by-step traces (`compare`, `swap`, `overwrite`, `pivot`, `mark_sorted`) in microsecond timeframes.
- 🧪 **22 Sorting Algorithms**:
  - **Comparison Sorts**: Bubble Sort, Cocktail Shaker Sort, Comb Sort, Cycle Sort, Gnome Sort, Heap Sort, Insertion Sort, Merge Sort, Odd-Even Sort, Pancake Sort, Quicksort, Selection Sort, Shell Sort, 3-Way Merge Sort, Bitonic Sort, and Bogo Sort.
  - **Distribution Sorts**: Counting Sort, Radix Sort (LSD), Bucket Sort, and Pigeonhole Sort.
  - **Hybrid Sorts**: TimSort (Python/Java standard) and IntroSort (C++ `std::sort` standard).
- 🌓 **Dynamic Light & Dark Themes**: Pixel-perfect light and dark themes with system preference detection and persistent localStorage toggle.
- ⏯️ **Precision Playback & Scrubbing**: Play, pause, speed adjustment (1x to 4096x), bidirectional discrete single-stepping, and timeline scrubbing across thousands of steps.
- 🎨 **Hardware-Accelerated 60 FPS Canvas**: Smooth, responsive rendering with intuitive visual state indicators for active comparisons, swaps, pivots, and sorted elements.
- 🎵 **Web Audio API Tone Synthesizer**: Dynamic pitch mapping proportional to array element values—listen to sorting patterns, partitions, and convergence in real time.
- 📊 **Real-Time Pedagogical Metrics**: Instantaneous tracking of comparison counts, swap/overwrite counts, compute latency (in microseconds), and asymptotic Big-O badges.
- 📦 **Single-Binary Zero-Dependency Deployment**: Production builds bundle the compiled React application directly into the Go executable via `//go:embed`.

---

## 🎨 Visual State Legend

The HTML5 Canvas visualizer highlights element states at each discrete step using distinct color signatures:

| State | Color | Description |
| :--- | :--- | :--- |
| **Default** | `🟣 Royal Violet (#5B42E6)` | Resting array element not actively participating in the current operation. |
| **Comparing** | `🟡 Amber Yellow (#F59E0B)` | Elements currently being evaluated against each other by the algorithm. |
| **Swapping / Overwrite** | `🔴 Rose Red (#F43F5E)` | Elements actively exchanging positions or being overwritten in-place. |
| **Pivot** | `🟣 Violet Purple (#8B5CF6)` | Partition pivot element selected for divide-and-conquer splitting. |
| **Sorted** | `🟢 Emerald Green (#10B981)` | Element confirmed to have reached its definitive, permanent sorted index. |
| **Unsorted / Limit Exceeded** | `🔴 Crimson Red (#EF4444)` | Elements remaining unsorted after reaching execution safety limits (e.g., Bogo Sort). |

---

## 🕹️ Controls & API Reference

### Playback & Array Controls

| Control | Action | Description |
| :--- | :--- | :--- |
| **Algorithm Selector** | Switch Algorithm | Select from 22 algorithms grouped by category (*Comparison*, *Distribution*, *Hybrid*). |
| **Array Size Slider** | Resize Array | Adjust dataset size from 25 up to 500 elements. |
| **Preset Generators** | Array Distribution | Generate **Random**, **Reverse**, or **Nearly Sorted** (10% perturbation) initial arrays. |
| <kbd>Play</kbd> / <kbd>Pause</kbd> | Toggle Animation | Start or pause the sorting trace replay. |
| **Speed Slider** | Dynamic Rate | Toggle between 13 speed presets: `1x`, `2x`, `4x`, `8x`, `16x`, `32x`, `64x`, `128x`, `256x`, `512x`, `1024x`, `2048x`, and `4096x`. |
| <kbd>⏮ Step Back</kbd> | Rewind Frame | Step backward exactly one discrete operation. |
| **Timeline Scrubber** | Direct Navigation | Scrub forward or backward across the entire sorting trace history. |
| <kbd>Step Forward ⏭</kbd> | Advance Frame | Step forward exactly one discrete operation. |
| <kbd>🔊 Mute</kbd> / <kbd>🔇 Unmute</kbd> | Toggle Audio | Enable or disable real-time Web Audio API frequency synthesis. |

---

### 📚 Algorithm Complexity & Stability Comparison

The SortPulse engine implements 22 sorting algorithms across comparison, distribution, and hybrid paradigms:

| Algorithm | Category | Best Time | Average Time | Worst Time | Space | Stable |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **3-Way Merge Sort** | Comparison | O(n log₃ n) | O(n log₃ n) | O(n log₃ n) | O(n) | ✅ |
| **Bitonic Sort** | Comparison (Network) | O(n log² n) | O(n log² n) | O(n log² n) | O(log² n) | ❌ |
| **Bogo Sort** | Comparison (Permutation) | O(n) | O((n+1)!) | O(∞) | O(1) | ❌ |
| **Bubble Sort** | Comparison | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| **Bucket Sort** | Distribution | O(n + k) | O(n + k) | O(n²) | O(n + k) | ✅ |
| **Cocktail Shaker Sort** | Comparison | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| **Comb Sort** | Comparison | O(n log n) | O(n² / 2^p) | O(n²) | O(1) | ❌ |
| **Counting Sort** | Distribution | O(n + k) | O(n + k) | O(n + k) | O(k) | ✅ |
| **Cycle Sort** | Comparison (Writes-optimal) | O(n²) | O(n²) | O(n²) | O(1) | ❌ |
| **Gnome Sort** | Comparison | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| **Heap Sort** | Comparison | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ |
| **Insertion Sort** | Comparison | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| **IntroSort** | Hybrid (Quick+Heap+Insert) | O(n log n) | O(n log n) | O(n log n) | O(log n) | ❌ |
| **Merge Sort** | Comparison | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| **Odd-Even Sort** | Comparison | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| **Pancake Sort** | Comparison (Prefix Reversals) | O(n) | O(n²) | O(n²) | O(1) | ❌ |
| **Pigeonhole Sort** | Distribution | O(n + k) | O(n + k) | O(n + k) | O(k) | ✅ |
| **Quicksort** | Comparison | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |
| **Radix Sort (LSD)** | Distribution | O(d · (n + k)) | O(d · (n + k)) | O(d · (n + k)) | O(n + k) | ✅ |
| **Selection Sort** | Comparison | O(n²) | O(n²) | O(n²) | O(1) | ❌ |
| **Shell Sort** | Comparison | O(n log n) | O(n^(4/3)) | O(n²) | O(1) | ❌ |
| **TimSort** | Hybrid (Merge+Insert) | O(n) | O(n log n) | O(n log n) | O(n) | ✅ |

---

### 🌐 REST API Endpoints

SortPulse exposes a JSON REST API for querying algorithm metadata and generating traces programmatically:

#### 1. List Registered Algorithms
```http
GET /api/algorithms
```

**Response (`200 OK`):**
```json
[
  {
    "id": "quick",
    "name": "Quicksort",
    "category": "comparison",
    "best_time": "O(n log n)",
    "average_time": "O(n log n)",
    "worst_time": "O(n²)",
    "space_complexity": "O(log n)",
    "stable": false,
    "description": "A divide-and-conquer comparison algorithm that selects a pivot..."
  }
]
```

#### 2. Execute Sort & Generate Trace
```http
POST /api/sort
Content-Type: application/json
```

**Request Body:**
```json
{
  "algorithm": "quick",
  "array": [64, 34, 25, 12, 22, 11, 90]
}
```

**Response (`200 OK`):**
```json
{
  "algorithm": "quick",
  "initial_array": [64, 34, 25, 12, 22, 11, 90],
  "final_array": [11, 12, 22, 25, 34, 64, 90],
  "steps": [
    {
      "type": "compare",
      "indices": [0, 6],
      "description": "Quicksort compare: arr[0] (64) and pivot arr[6] (90)"
    },
    {
      "type": "swap",
      "indices": [0, 1],
      "description": "Quicksort swap: arr[0] and arr[1]"
    }
  ],
  "total_steps": 24,
  "comparisons": 14,
  "swaps": 10,
  "execution_time_us": 12
}
```

---

## 📂 Project Architecture Hierarchy

```text
sortpulse/
├── cmd/
│   └── server/                  # HTTP server entrypoint with embedded static file serving
│       └── main.go              # Mux routing, SPA fallback handler, and graceful timeouts
├── internal/
│   ├── api/                     # REST API layer
│   │   ├── cors.go              # CORS configuration and security response headers
│   │   ├── handlers.go          # Handlers for /api/algorithms and /api/sort
│   │   └── handlers_test.go     # API integration & unit tests
│   └── sorter/                  # Core sorting and trace recording engine
│       ├── model.go             # StepType, Step, Trace, AlgorithmMeta, and Sorter interface
│       ├── tracer.go            # Step history recorder and counter manager
│       ├── registry.go          # Thread-safe central sorter registry
│       ├── bitonic.go           # Bitonic Sort implementation
│       ├── bogo.go              # Bogo Sort with safety iteration budget
│       ├── bubble.go            # Bubble Sort implementation
│       ├── bucket.go            # Bucket Sort implementation
│       ├── cocktail.go          # Cocktail Shaker Sort implementation
│       ├── comb.go              # Comb Sort implementation
│       ├── counting.go          # Counting Sort implementation
│       ├── cycle.go             # Cycle Sort implementation
│       ├── gnome.go             # Gnome Sort implementation
│       ├── heap.go              # Heap Sort implementation
│       ├── insertion.go         # Insertion Sort implementation
│       ├── introsort.go         # IntroSort hybrid implementation
│       ├── merge.go             # Merge Sort implementation
│       ├── oddeven.go           # Odd-Even Sort implementation
│       ├── pancake.go           # Pancake Sort implementation
│       ├── pigeonhole.go        # Pigeonhole Sort implementation
│       ├── quick.go             # Quicksort implementation
│       ├── radix.go             # Radix Sort (LSD) implementation
│       ├── selection.go         # Selection Sort implementation
│       ├── shell.go             # Shell Sort implementation
│       ├── three_way_merge.go   # 3-Way Merge Sort implementation
│       ├── timsort.go           # TimSort hybrid implementation
│       └── *_test.go            # Comprehensive test suites for all algorithms
├── frontend/                    # React + TypeScript + Vite frontend application
│   ├── embed.go                 # go:embed directive exporting dist/ as an fs.FS
│   ├── package.json             # NPM dependencies (React 18, Vite 6, Oxlint)
│   ├── vite.config.ts           # Vite build pipeline and backend proxy config
│   └── src/
│       ├── main.tsx             # React application DOM entrypoint
│       ├── App.tsx              # Main state machine, animation loops, and audio hooks
│       ├── types/sort.ts        # TypeScript interfaces mirror Go models
│       ├── api/client.ts        # Fetch client communicating with Go backend
│       ├── components/
│       │   ├── CanvasVisualizer.tsx # Hardware-accelerated 60 FPS HTML5 Canvas
│       │   ├── ControlBar.tsx       # Playback, array generation, speed & scrub controls
│       │   └── AlgorithmInfoCard.tsx# Pedagogical Big-O complexities and descriptions
│       └── utils/audio.ts       # Web Audio API tone generator and synthesizer
├── lefthook.yml                 # Git pre-commit & commit-msg hooks configuration
├── Makefile                     # Developer workflow task targets
└── README.md                    # Project showcase, architecture & API guide
```

---

## 🚀 Getting Started

### Prerequisites

- **[Go](https://golang.org/)** (version 1.22 or higher)
- **[Node.js](https://nodejs.org/)** (version 20 or higher) and `npm`

---

### 📦 Single-Binary Production Build

SortPulse packages the entire frontend directly into the Go executable, producing a single, self-contained binary:

Using `make` (recommended):
```bash
make build
./sortpulse
```

Navigate to **`http://localhost:8080`** in your browser.

---

### 🛠️ Local Development Setup

To run both backend and frontend concurrently with live reloading:

1. **Start the Go Backend Server**:
   ```bash
   go run ./server
   ```
   The backend API will start on `http://localhost:8080`.

2. **Start the React Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open **`http://localhost:5173`** in your browser. Vite automatically proxies API requests to the Go backend on `localhost:8080`.

---

## 🧪 Code Quality & Verification Commands

SortPulse enforces strict code quality and formatting across both Go and TypeScript:

| Command | Action |
| :--- | :--- |
| `make test` | Runs the full Go unit and property test suite across all 22 algorithms. |
| `make lint` | Runs [Oxlint](https://oxc.rs) across the frontend TypeScript/React codebase. |
| `go vet ./...` | Runs official Go static analysis checks. |
| `lefthook run pre-commit` | Runs pre-commit validation (tests, vetting, and linting) in parallel. |

```bash
# Run tests and linter
make test
make lint
go vet ./...
```

---

## 👤 Author & Acknowledgments

- **Author**: Carlos M. ([@CFMVCarlos](https://github.com/CFMVCarlos))
- **Platform**: Built as an algorithmic laboratory project for [Boot.dev](https://boot.dev).
- **License**: Released under the [MIT License](LICENSE).

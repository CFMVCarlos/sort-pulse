import { useState, useEffect, useRef, useCallback } from 'react';
import type { AlgorithmMeta, Trace } from './types/sort';
import { SPEED_LEVELS } from './types/sort';
import { fetchAlgorithms, fetchSortTrace } from './api/client';
import { ControlBar } from './components/ControlBar';
import { VisualizerPanel } from './components/VisualizerPanel';
import { AlgorithmInfoCard } from './components/AlgorithmInfoCard';
import type { BarState } from './components/CanvasVisualizer';
import { audioEngine } from './utils/audio';
import { Loader2 } from 'lucide-react';
import { Toast } from './components/ui/toast';
import { Skeleton } from './components/ui/skeleton';

function App() {
  const [algorithms, setAlgorithms] = useState<AlgorithmMeta[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');

  // Dark mode state with persistence
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sortpulse_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      localStorage.setItem('sortpulse_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
      localStorage.setItem('sortpulse_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Array state
  const [arraySize, setArraySize] = useState<number>(50);
  const [selectedArrayType, setSelectedArrayType] = useState<'random' | 'reverse' | 'nearly_sorted'>('random');
  const [currentArray, setCurrentArray] = useState<number[]>([]);
  const [barStates, setBarStates] = useState<BarState[]>([]);
  const baseArrayRef = useRef<number[]>([]);

  // Playback state
  const [trace, setTrace] = useState<Trace | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedLevel, setSpeedLevel] = useState<number>(3); // Level 3 corresponds to 8x speed
  const [currentComparisons, setCurrentComparisons] = useState<number>(0);
  const [currentSwaps, setCurrentSwaps] = useState<number>(0);

  // Audio state
  const [isMuted, setIsMuted] = useState<boolean>(audioEngine.getMuted());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoadingAlgorithms, setIsLoadingAlgorithms] = useState<boolean>(true);

  // Ref for timer to clear it
  const timerRef = useRef<number | null>(null);
  const maxValRef = useRef<number>(100);
  const cachedStateRef = useRef<{
    trace: Trace | null;
    stepIndex: number;
    array: number[];
    sortedIndices: Set<number>;
    comparisons: number;
    swaps: number;
  }>({
    trace: null,
    stepIndex: -1,
    array: [],
    sortedIndices: new Set<number>(),
    comparisons: 0,
    swaps: 0,
  });

  const loadAlgorithms = async () => {
    try {
      setIsLoadingAlgorithms(true);
      setErrorMessage(null);
      const algos = await fetchAlgorithms();
      setAlgorithms(algos);
      if (algos.length > 0) {
        setSelectedAlgorithm(algos[0].id);
      }
    } catch (error) {
      console.error("Failed to load algorithms:", error);
      setErrorMessage("Could not connect to the backend server. Ensure the server is running on :8080.");
    } finally {
      setIsLoadingAlgorithms(false);
    }
  };

  const generateArray = (type: 'random' | 'reverse' | 'nearly_sorted', size: number) => {
    setSelectedArrayType(type);
    let newArr: number[] = [];
    if (type === 'random') {
      for (let i = 0; i < size; i++) {
        newArr.push(Math.floor(Math.random() * 100) + 1);
      }
    } else if (type === 'reverse') {
      for (let i = size; i > 0; i--) {
        newArr.push(i);
      }
    } else if (type === 'nearly_sorted') {
      for (let i = 1; i <= size; i++) {
        newArr.push(i);
      }
      // Swap a few elements
      const swaps = Math.max(1, Math.floor(size * 0.1));
      for (let i = 0; i < swaps; i++) {
        const idx1 = Math.floor(Math.random() * size);
        const idx2 = Math.floor(Math.random() * size);
        [newArr[idx1], newArr[idx2]] = [newArr[idx2], newArr[idx1]];
      }
    }

    maxValRef.current = Math.max(...newArr);
    baseArrayRef.current = [...newArr];

    setCurrentArray(newArr);
    setBarStates(new Array(size).fill('default'));
    setTrace(null);
    setCurrentStepIndex(0);
    setCurrentComparisons(0);
    setCurrentSwaps(0);
    setIsPlaying(false);
    cachedStateRef.current = {
      trace: null,
      stepIndex: -1,
      array: [],
      sortedIndices: new Set<number>(),
      comparisons: 0,
      swaps: 0,
    };
  };

  // Initial load
  useEffect(() => {
    loadAlgorithms();
    generateArray('random', 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleArraySizeChange = (size: number) => {
    setArraySize(size);
    generateArray(selectedArrayType, size);
  };

  const startSorting = async () => {
    if (!selectedAlgorithm) return;

    // Always sort from the base unsorted array so re-running or switching algorithms doesn't sort already-sorted data
    const inputArr = baseArrayRef.current.length > 0 ? [...baseArrayRef.current] : [...currentArray];
    setCurrentArray([...inputArr]);
    setBarStates(new Array(inputArr.length).fill('default'));

    try {
      setIsGenerating(true);
      setErrorMessage(null);
      const newTrace = await fetchSortTrace(selectedAlgorithm, inputArr);
      setTrace(newTrace);
      setCurrentStepIndex(0);
      setCurrentComparisons(0);
      setCurrentSwaps(0);
      cachedStateRef.current = {
        trace: null,
        stepIndex: -1,
        array: [],
        sortedIndices: new Set<number>(),
        comparisons: 0,
        swaps: 0,
      };
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to fetch sort trace:", error);
      setErrorMessage("Failed to calculate sorting steps. Please try again.");
      setIsPlaying(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // If we finished playing or haven't started, fetch/reset
      if (!trace || currentStepIndex >= trace.steps.length) {
        startSorting();
      } else {
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(audioEngine.toggleMute());
  };

  const playStepAudio = useCallback((stepIndex: number, tempArray: number[]) => {
      if (!trace || stepIndex < 0 || stepIndex >= trace.steps.length) return;
      const s = trace.steps[stepIndex];
      if (s.type === 'compare' || s.type === 'swap') {
          const val = tempArray[s.indices[0]]; // play tone for first index involved
          audioEngine.playTone(val, maxValRef.current);
      } else if (s.type === 'overwrite' && s.value !== undefined) {
          audioEngine.playTone(s.value, maxValRef.current);
      } else if (s.type === 'mark_sorted' && s.indices.length > 0) {
          const val = tempArray[s.indices[0]];
          audioEngine.playTone(val, maxValRef.current);
      }
  }, [trace]);

  // Check if final array was actually sorted (detect Bogo sort limit abortions)
  const isFinalSorted = trace
    ? trace.final_array.every((val, i, arr) => i === 0 || arr[i - 1] <= val)
    : true;

  // State machine for step execution
  useEffect(() => {
    if (!trace) return;

    if (currentStepIndex >= trace.steps.length && isPlaying) {
      setIsPlaying(false);
      setBarStates(new Array(currentArray.length).fill(isFinalSorted ? 'sorted' : 'unsorted'));
      return;
    }

    const rebuildState = () => {
      let tempArray: number[];
      const sortedIndices = new Set<number>();
      let comparisons = 0;
      let swaps = 0;
      let startStep = 0;

      const cache = cachedStateRef.current;
      if (
        cache.trace === trace &&
        cache.stepIndex >= 0 &&
        cache.stepIndex <= currentStepIndex
      ) {
        tempArray = [...cache.array];
        cache.sortedIndices.forEach((idx) => sortedIndices.add(idx));
        comparisons = cache.comparisons;
        swaps = cache.swaps;
        startStep = cache.stepIndex + 1;
      } else {
        tempArray = [...trace.initial_array];
        startStep = 0;
      }

      let tempStates = new Array<BarState>(tempArray.length).fill('default');

      // Rebuild from startStep up to currentStepIndex
      for (let i = startStep; i <= currentStepIndex; i++) {
        if (i >= trace.steps.length) break;
        const s = trace.steps[i];

        if (s.type === 'compare') {
          comparisons++;
          if (i === currentStepIndex) {
            s.indices.forEach((idx) => (tempStates[idx] = 'comparing'));
          }
        } else if (s.type === 'swap') {
          swaps++;
          const [idx1, idx2] = s.indices;
          [tempArray[idx1], tempArray[idx2]] = [tempArray[idx2], tempArray[idx1]];
          if (i === currentStepIndex) {
            tempStates[idx1] = 'swapping';
            tempStates[idx2] = 'swapping';
          }
        } else if (s.type === 'overwrite') {
          swaps++;
          const idx = s.indices[0];
          if (s.value !== undefined) {
            tempArray[idx] = s.value;
          }
          if (i === currentStepIndex) {
            tempStates[idx] = 'swapping';
          }
        } else if (s.type === 'mark_sorted') {
          s.indices.forEach((idx) => {
            sortedIndices.add(idx);
            if (i === currentStepIndex) {
              tempStates[idx] = 'sorted';
            }
          });
        } else if (s.type === 'pivot') {
          if (i === currentStepIndex) {
            s.indices.forEach((idx) => (tempStates[idx] = 'pivot'));
          }
        }
      }

      // If finished and aborted unsorted (e.g. Bogo limit reached), color bars red
      if (currentStepIndex >= trace.steps.length) {
        if (!isFinalSorted) {
          tempStates = new Array(tempArray.length).fill('unsorted');
        } else {
          tempStates = new Array(tempArray.length).fill('sorted');
        }
      } else {
        // Ensure all previously marked sorted remain green
        sortedIndices.forEach((idx) => {
          if (tempStates[idx] === 'default') {
            tempStates[idx] = 'sorted';
          }
        });
      }

      // Update cache for next tick
      cachedStateRef.current = {
        trace,
        stepIndex: currentStepIndex,
        array: [...tempArray],
        sortedIndices: new Set(sortedIndices),
        comparisons,
        swaps,
      };

      return { tempArray, tempStates, comparisons, swaps };
    };

    const { tempArray, tempStates, comparisons, swaps } = rebuildState();

    setCurrentArray(tempArray);
    setBarStates(tempStates);
    setCurrentComparisons(comparisons);
    setCurrentSwaps(swaps);

    if (isPlaying) {
       playStepAudio(currentStepIndex, tempArray);
       const config = SPEED_LEVELS[speedLevel] || SPEED_LEVELS[3];
       timerRef.current = window.setTimeout(() => {
         setCurrentStepIndex(prev => Math.min(prev + config.batch, trace.steps.length));
       }, config.delay);
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, trace, speedLevel, currentArray.length, playStepAudio, isFinalSorted]);

  const handleScrub = (step: number) => {
    setIsPlaying(false);
    if (trace) {
      setCurrentStepIndex(Math.min(Math.max(step, 0), trace.steps.length));
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (trace && currentStepIndex < trace.steps.length) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const isUnsortedAborted = Boolean(
    trace &&
    currentStepIndex >= trace.steps.length &&
    !isFinalSorted
  );

  return (
    <div className="min-h-screen w-full bg-slate-50/50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8 font-sans antialiased transition-colors duration-200">
      {errorMessage && (
        <Toast message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}

      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Generating execution trace...</span>
          </div>
        </div>
      )}

      <main className="w-full max-w-7xl flex flex-col gap-5 sm:gap-6 relative">
        {/* Upper section: 2 columns (Visualizer on top on mobile, Controls on left on desktop) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* Visualizer ("bars") Column with embedded timeline scrubber and stats */}
          <div className="order-1 lg:order-2 lg:col-span-8 xl:col-span-8 flex">
            <VisualizerPanel
              array={currentArray}
              barStates={barStates}
              trace={trace}
              currentStepIndex={currentStepIndex}
              currentComparisons={currentComparisons}
              currentSwaps={currentSwaps}
              isPlaying={isPlaying}
              isUnsortedAborted={isUnsortedAborted}
              onScrub={handleScrub}
              onStepBackward={handleStepBackward}
              onStepForward={handleStepForward}
              onTogglePlay={togglePlay}
              isDark={isDark}
              onToggleTheme={toggleTheme}
            />
          </div>

          {/* Controls Column */}
          <div className="order-2 lg:order-1 lg:col-span-4 xl:col-span-4 flex">
            {isLoadingAlgorithms ? (
              <div className="space-y-4 w-full bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full mt-4 flex-1" />
              </div>
            ) : (
              <ControlBar
                algorithms={algorithms}
                selectedAlgorithm={selectedAlgorithm}
                onAlgorithmChange={(id) => {
                  setSelectedAlgorithm(id);
                  setTrace(null);
                  setCurrentStepIndex(0);
                  setIsPlaying(false);
                  const restoreArr = baseArrayRef.current.length > 0 ? [...baseArrayRef.current] : (trace ? [...trace.initial_array] : currentArray);
                  setCurrentArray([...restoreArr]);
                  setBarStates(new Array(restoreArr.length).fill('default'));
                  setCurrentComparisons(0);
                  setCurrentSwaps(0);
                  cachedStateRef.current = {
                    trace: null,
                    stepIndex: -1,
                    array: [],
                    sortedIndices: new Set<number>(),
                    comparisons: 0,
                    swaps: 0,
                  };
                }}
                arraySize={arraySize}
                onArraySizeChange={handleArraySizeChange}
                onGenerateArray={(type) => generateArray(type, arraySize)}
                selectedArrayType={selectedArrayType}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                speedLevel={speedLevel}
                onSpeedLevelChange={setSpeedLevel}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                isDark={isDark}
                onToggleTheme={toggleTheme}
              />
            )}
          </div>
        </section>

        {/* Lower section: 100% full width Algorithm Description & Complexities Card */}
        <section className="w-full">
          {isLoadingAlgorithms ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : (
            <AlgorithmInfoCard
              algorithm={algorithms.find((a) => a.id === selectedAlgorithm) || null}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

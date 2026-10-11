import { z } from 'zod';
import type { AlgorithmMeta, Trace } from '../types/sort';

const API_BASE = import.meta.env.DEV ? 'http://localhost:8080/api' : '/api';

// Zod schemas for rigorous validation
const AlgorithmMetaSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    best_time: z.string(),
    average_time: z.string(),
    worst_time: z.string(),
    space_complexity: z.string(),
    stable: z.boolean(),
    description: z.string(),
});

const StepSchema = z.object({
    type: z.enum(['compare', 'swap', 'overwrite', 'pivot', 'mark_sorted']),
    indices: z.array(z.number()),
    description: z.string(),
    value: z.number().optional(),
});

const TraceSchema = z.object({
    algorithm: z.string(),
    initial_array: z.array(z.number()),
    final_array: z.array(z.number()),
    steps: z.array(StepSchema),
    total_steps: z.number(),
    comparisons: z.number(),
    swaps: z.number(),
    execution_time_us: z.number(),
});

const APIErrorSchema = z.object({
    status: z.string(),
    message: z.string(),
    code: z.number(),
});

/**
 * Retrieves the catalog of registered sorting algorithms and asymptotic metadata from the backend.
 * @returns Array of AlgorithmMeta objects.
 */
export async function fetchAlgorithms(): Promise<AlgorithmMeta[]> {
    const response = await fetch(`${API_BASE}/algorithms`);

    if (!response.ok) {
        let errMsg = response.statusText;
        try {
            const errData = await response.json();
            const parsedError = APIErrorSchema.parse(errData);
            errMsg = parsedError.message;
        } catch {
            // fallback if not a structured JSON error
        }
        throw new Error(`Failed to fetch algorithms: ${errMsg}`);
    }

    const data = await response.json();
    return z.array(AlgorithmMetaSchema).parse(data) as AlgorithmMeta[];
}

/**
 * Dispatches an array and algorithm ID to the server to compute and record the step-by-step trace.
 * @param algorithmId Identifier of the sorting algorithm (e.g. 'bubble', 'quick').
 * @param array Array of integers to sort.
 * @returns Fully deterministic Trace object with steps and statistics.
 */
export async function fetchSortTrace(algorithmId: string, array: number[]): Promise<Trace> {
    const response = await fetch(`${API_BASE}/sort`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ algorithm: algorithmId, array }),
    });

    if (!response.ok) {
        let errMsg = response.statusText;
        try {
            const errData = await response.json();
            const parsedError = APIErrorSchema.parse(errData);
            errMsg = parsedError.message;
        } catch {
            // fallback if not a structured JSON error
        }
        throw new Error(`Failed to fetch sort trace: ${errMsg}`);
    }

    const data = await response.json();
    return TraceSchema.parse(data) as Trace;
}

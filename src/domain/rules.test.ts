
import { describe, it, expect } from 'vitest';
import { isTaskActionable, isTaskBlocked } from './dependencies';
import { propagateStateChange } from './propagation';
import type { Task, TaskState } from '@/types/task';
import { buildTaskMap } from './dependencies';

/**
 * Test Suite for Dependency Rules
 */

// Helper to create valid task objects
function createTask(id: number, state: TaskState = 'TODO', blockers: number[] = []): Task {
    return {
        id,
        title: `Task ${id}`,
        description: '',
        state,
        blockers,
        dependents: [],
        due_date: null,
        completed_at: null,
        created_at: '',
        updated_at: '',
    };
}

describe('Dependency Rules', () => {

    describe('1. Blocking vs Actionable', () => {
        it('A task is blocked if any of its dependencies is not "done"', () => {
            // Task 2 depends on Task 1 (TODO)
            const t1 = createTask(1, 'TODO');
            const t2 = createTask(2, 'TODO', [1]);
            const taskMap = buildTaskMap([t1, t2]);

            // Blocking
            expect(isTaskBlocked(t2, taskMap)).toBe(true);

            // Actionable
            // It is blocked, so it should NOT be actionable
            expect(isTaskActionable(t2, taskMap)).toBe(false);
        });

        it('A task is actionable if all of its dependencies are "done"', () => {
            // Task 2 depends on Task 1 (DONE)
            const t1 = createTask(1, 'DONE');
            const t2 = createTask(2, 'TODO', [1]);
            const taskMap = buildTaskMap([t1, t2]);

            // Blocking
            expect(isTaskBlocked(t2, taskMap)).toBe(false);

            // Actionable
            expect(isTaskActionable(t2, taskMap)).toBe(true);
        });

        it('A task is blocked if one dependency is done but another is not', () => {
            // Task 3 depends on Task 1 (DONE) and Task 2 (TODO)
            const t1 = createTask(1, 'DONE');
            const t2 = createTask(2, 'TODO');
            const t3 = createTask(3, 'TODO', [1, 2]);
            const taskMap = buildTaskMap([t1, t2, t3]);

            expect(isTaskBlocked(t3, taskMap)).toBe(true);
            expect(isTaskActionable(t3, taskMap)).toBe(false);
        });
    });

    describe('2. Automatic transitions', () => {
        it('When a task becomes actionable and is "blocked", it must automatically change to "todo"', () => {
            // Initial: T2 depends on T1(TODO). T2 is BLOCKED.
            const t1 = createTask(1, 'TODO');
            const t2 = createTask(2, 'BLOCKED', [1]);

            // Action: Mark T1 as DONE
            // Use propagation to handle automatic transition
            const updatedTasks = propagateStateChange(1, 'DONE', [t1, t2]);

            const updatedT2 = updatedTasks.find(t => t.id === 2);
            expect(updatedT2?.state).toBe('TODO');
        });

        it('When a task becomes blocked, it must automatically change to "blocked"', () => {
            // Initial: T2 depends on T1(DONE). T2 is TODO.
            const t1 = createTask(1, 'DONE');
            const t2 = createTask(2, 'TODO', [1]);

            // Action: Mark T1 as TODO (revert)
            const updatedTasks = propagateStateChange(1, 'TODO', [t1, t2]);

            const updatedT2 = updatedTasks.find(t => t.id === 2);
            expect(updatedT2?.state).toBe('BLOCKED');
        });
    });

    describe('4. Propagation (Recursive)', () => {
        it('Updates must propagate recursively through all downstream dependents', () => {
            // Chain: T1 -> T2 -> T3
            // Initial: T1(TODO), T2(BLOCKED), T3(BLOCKED)
            const t1 = createTask(1, 'TODO');
            const t2 = createTask(2, 'BLOCKED', [1]);
            const t3 = createTask(3, 'BLOCKED', [2]);
            t1.dependents = [2];
            t2.dependents = [3];

            // Action: Mark T1 as DONE
            // Expected: T2 becomes TODO. Since T2 is now TODO (not DONE), T3 remains BLOCKED (or re-evaluates but stays BLOCKED because T2 isn't DONE yet).

            // Wait, T3 depends on T2. Logic: T3 is blocked if T2 is not DONE.
            // If T2 becomes TODO, T2 is NOT DONE. So T3 is still blocked. Correct.

            let result = propagateStateChange(1, 'DONE', [t1, t2, t3]);
            let resT2 = result.find(t => t.id === 2);
            let resT3 = result.find(t => t.id === 3);

            expect(resT2?.state).toBe('TODO');
            expect(resT3?.state).toBe('BLOCKED');

            // Now Mark T2 as DONE
            // Expected: T3 becomes TODO
            result = propagateStateChange(2, 'DONE', result);
            resT3 = result.find(t => t.id === 3);
            expect(resT3?.state).toBe('TODO');
        });

        it('Recursive blocking: Un-doing T1 blocks T2, which blocks T3', () => {
            // Initial: T1(DONE), T2(DONE), T3(DONE) (assuming T3 was done) or T3(TODO)
            // Let's say: T1 -> T2 -> T3
            const t1 = createTask(1, 'DONE');
            const t2 = createTask(2, 'DONE', [1]);
            const t3 = createTask(3, 'TODO', [2]); // T3 actionable

            // Action: Mark T1 as TODO
            // Expected: T2 becomes BLOCKED. T3 becomes BLOCKED (because T2 is no longer DONE).

            const result = propagateStateChange(1, 'TODO', [t1, t2, t3]);

            const resT2 = result.find(t => t.id === 2);
            const resT3 = result.find(t => t.id === 3);

            expect(resT2?.state).toBe('BLOCKED');
            expect(resT3?.state).toBe('BLOCKED');
        });
    });

    describe('6. Reasonable simplification', () => {
        it('If dependent is "done" and dependency reverts, dependent must become "blocked"', () => {
            // T1 -> T2
            // Initial: T1(DONE), T2(DONE)
            const t1 = createTask(1, 'DONE');
            const t2 = createTask(2, 'DONE', [1]);

            const result = propagateStateChange(1, 'TODO', [t1, t2]);
            const resT2 = result.find(t => t.id === 2);

            expect(resT2?.state).toBe('BLOCKED');
        });
    });
});

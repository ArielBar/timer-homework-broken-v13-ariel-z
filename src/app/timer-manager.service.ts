import {Injectable} from '@angular/core';
import {BehaviorSubject, EMPTY, Observable, of, Subscription, switchMap, timer} from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class TimerManagerService {
    readonly initialValue = 0;
    private timers: {
        id: number;
        subj$: BehaviorSubject<number>;
        isRunning: boolean;
    }[] = [];

    private timerSubscription: Subscription | undefined;

    getTimer(id: number): Observable<number> {
        const newTimer = this.createTimer();
        this.timers.push({id, subj$: newTimer, isRunning: false});
        return newTimer.asObservable();
    }

    private createTimer() {
        return new BehaviorSubject<number>(this.initialValue);
    }

    public playTimer(id: number): void {
        const timer = this.timers.find((x) => x.id === id);
        if (timer) {
            timer.isRunning = true;
            this.runTimers();
        }
    }

    public pauseTimer(id: number): void {
        const timer = this.timers.find((x) => x.id === id);
        if (timer) {
            timer.isRunning = false;
            this.stopTimers()
        }
    }

    private runTimers(): void {
        if (this.timerSubscription) {
            return;
        }

        this.timerSubscription = timer(0, 1000)
            .pipe(
                switchMap(() => {
                    const runningTimer = this.timers.find((timer) => timer.isRunning);
                    return runningTimer ? of(runningTimer) : EMPTY;
                }),
                tap((runningTimer) => {
                    runningTimer.subj$.next(runningTimer.subj$.value + 1);
                })
            )
            .subscribe();
    }

    private stopTimers(): void {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
            this.timerSubscription = undefined;
        }
    }
}

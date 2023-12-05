import {Injectable} from '@angular/core';
import {TaskModel} from './models/task-model';
import {combineLatest, Observable, of, switchMap} from 'rxjs';
import {TaskFactoryService} from './task-factory.service';
import {map} from 'rxjs/operators';
import {CloneSubject} from './clone-subject';
import {ValidationErrors} from "@angular/forms";

@Injectable({
  providedIn: 'root',
})
export class LogicService {
  readonly initialState: TaskModel[] = [];
  private state: TaskModel[] = [...this.initialState];
  private logicSubj$ = new CloneSubject(this.state);

  constructor(private taskService: TaskFactoryService) {
  }

  public get tasks$(): Observable<TaskModel[]> {
    return this.logicSubj$.asObservable();
  }

  public addTask(tskName: string) {
    const newTask = this.taskService.createTask(tskName);
    this.state.push(newTask);
    this.doNext();
  }

  public updateTask(evt: TaskModel): void {
    const index = this.state.findIndex((tsk) => tsk.id === evt.id);
    this.state = this.toggleAllButtonTexts(this.state, index);
    this.doNext();
  }

  public get totalTime$(): Observable<number> {
    return this.tasks$.pipe(
      map((tasks) => tasks.map((task) => task.timer)),
      switchMap((tmr) =>
        combineLatest(tmr).pipe(
          map((x) => x.reduce((q, w) => q + w, 0))
        )
      )
    );
  }

  public nameExists(value: string): Observable<ValidationErrors> {
    return of(this.state.find((x) => x.name === value) !== undefined).pipe(
      map((result: boolean) => result ? {nameTaken: true} : null)
    );
  }

  private toggleAllButtonTexts(
    tasks: TaskModel[],
    selectedId: number
  ): TaskModel[] {
    tasks
      .filter((tsk) => tsk.id !== selectedId)
      .forEach((tsk) => this.inactivateButtons(tsk));
    this.toggleText(tasks[selectedId]);
    return tasks;
  }

  private inactivateButtons(tsk: TaskModel): void {
    if (tsk.buttonText === 'pause') {
      this.setPlay(tsk);
    }
  }

  private toggleText(tsk: TaskModel): void {
    if (tsk.buttonText === 'pause') {
      this.setPlay(tsk);
    } else {
      this.setPause(tsk);
    }
  }

  private setPlay(tsk: TaskModel) {
    tsk.buttonText = 'play_arrow';
    this.taskService.pause(tsk.id);
  }

  private setPause(tsk: TaskModel) {
    tsk.buttonText = 'pause';
    this.taskService.play(tsk.id);
  }

  private doNext() {
    this.logicSubj$.next(this.state);
  }
}

import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output,} from '@angular/core';
import {TaskModel} from '../models/task-model';

@Component({
  selector: 'app-task-presenter',
  templateUrl: './task-presenter.component.html',
  styleUrls: ['./task-presenter.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TaskPresenterComponent implements OnInit {
  @Input() task: TaskModel;
  @Output() clicked = new EventEmitter<TaskModel>();

  ngOnInit(): void {
  }

  public click() {
    this.clicked.emit(this.task);
  }
}

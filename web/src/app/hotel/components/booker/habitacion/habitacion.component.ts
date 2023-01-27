import { Component, Input, OnInit } from '@angular/core';
import { HabType } from './HabTypeE';

@Component({
  selector: 'app-habitacion',
  templateUrl: './habitacion.component.html',
  styleUrls: ['./habitacion.component.css'],
})

export class HabitacionComponent implements OnInit {

  @Input() resId?: string;
  @Input() text: string;
  @Input() type?: HabType;
  @Input() debaja: number = 0;

  constructor() {
  }

  ngOnInit(): void {
  }

}

import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {HabType} from './HabTypeE';



@Component({
  selector: 'app-habitacion',
  templateUrl: './habitacion.component.html',
  styleUrls: ['./habitacion.component.css'],
})

export class HabitacionComponent implements OnInit {

  @Input() resId: string;
  @Input() text: string;
  @Input() type: HabType;  

  constructor() {
  }

  ngOnInit(): void {
  }

}

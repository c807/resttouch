import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FakeBakend} from '../FakeBakend';
import {LiveAnnouncer} from '@angular/cdk/a11y';


/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'app-filter',
  styleUrls: ['filter.component.css'],
  templateUrl: 'filter.component.html',
})
export class FilterComponent implements OnInit   {

  displayedColumns: string[] = ['text', 'filter'];

  @Input()
  dataSourceR;

  dataSourceF;

  public filteredText;


  @Output() childEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() childEventEmitterUpdate: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    this.setdata();
  }

  cleanAll(): void {
    for (let a = 0; a < FakeBakend.RoomArrTypesFilter.length; a++) {
      FakeBakend.RoomArrTypesFilter[a].shouldFilter = false;
    }
    this.setdata();
    this.childEventEmitterUpdate.emit();
  }


  selectAll(): void {
    for (let a = 0; a < FakeBakend.RoomArrTypesFilter.length; a++) {
      FakeBakend.RoomArrTypesFilter[a].shouldFilter = true;
    }
    this.setdata();
    this.childEventEmitterUpdate.emit();
  }

  setdata(): void {
    if (this.filteredText !== undefined && this.filteredText !== '') {
      this.dataSourceF = this.dataSourceR.filter(bj =>
        (
          this.filteredText !== undefined && this.filteredText !== '' && bj.text.toUpperCase().includes(this.filteredText.toUpperCase())
        )
      );
    } else {
      this.dataSourceF = this.dataSourceR;
    }
  }

  toggle(value, element): void {
    //element.shouldFilter = value;
    this.childEventEmitter.emit(element);
  }

  filteredTextCh(event): void {
    this.setdata();
  }

  ngOnInit(): void {
    this.setdata();
  }
}

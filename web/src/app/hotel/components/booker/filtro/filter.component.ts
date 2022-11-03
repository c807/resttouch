import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'app-filter',
  styleUrls: ['filter.component.css'],
  templateUrl: 'filter.component.html',
})
export class FilterComponent implements OnInit {

  displayedColumns: string[] = ['text', 'filter'];

  @Input() dataSourceR;
  public dataSourceF;
  public filteredText;


  @Output() childEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() childEventEmitterUpdate: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    this.setdata();
  }

  cleanAll(): void {
    for (const tipHab of this.dataSourceR) {
      tipHab.shouldFilter = false;
    }
    this.setdata();
    this.childEventEmitterUpdate.emit();
  }


  selectAll(): void {
    for (const tipHab of this.dataSourceR) {
      tipHab.shouldFilter = true;
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
    console.log('DSF', this.dataSourceF);
    console.log('DSR', this.dataSourceR);
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

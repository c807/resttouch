import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table'

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'app-filter',
  styleUrls: ['filter.component.css'],
  templateUrl: 'filter.component.html',
})
export class FilterComponent implements OnInit {

  @ViewChild('tblFiltro') tblFiltro: MatTable<any[]>;

  displayedColumns: string[] = ['text', 'filter'];

  @Input() dataSourceR: any[];
  public dataSourceF: any[];
  public filteredText: string = '';


  @Output() childEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() childEventEmitterUpdate: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    this.setdata();
  }

  ngOnInit(): void {
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
    if (this.tblFiltro) {
      this.tblFiltro.renderRows();
    }
  }

  toggle(element: any): void {        
    this.childEventEmitter.emit(element);
  }

  filteredTextCh(): void {
    this.setdata();
  }
}

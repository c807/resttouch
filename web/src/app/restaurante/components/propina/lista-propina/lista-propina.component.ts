import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Propina } from '@restaurante-interfaces/propina';
import { PropinaService } from '@restaurante-services/propina.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-propina',
  templateUrl: './lista-propina.component.html',
  styleUrls: ['./lista-propina.component.css']
})
export class ListaPropinaComponent implements OnInit, OnDestroy {

  public displayedColumns: string[] = ['propina'];
  public dataSource: MatTableDataSource<Propina>;
  public lstPropinas: Propina[];
  @Output() getPropinaEv = new EventEmitter();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  private endSubs = new Subscription();

  constructor(private propinaSrvc: PropinaService) { }

  ngOnInit() {
    this.loadPropinas();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadPropinas = () => {
    this.endSubs.add(      
      this.propinaSrvc.get().subscribe(lst => {
        if (lst) {
          if (lst.length > 0) {
            this.lstPropinas = lst;
            this.dataSource = new MatTableDataSource(this.lstPropinas);
            this.dataSource.paginator = this.paginator;
          }
        }
      })
    );
  }

  getPropina = (obj: Propina) => {
    this.getPropinaEv.emit(obj);
  }
}

import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { PaginarArray, MultiFiltro } from '@shared/global';

import { TipoTurno } from '@restaurante-interfaces/tipo-turno';
import { TipoTurnoService } from '@restaurante-services/tipo-turno.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-turno-tipo',
  templateUrl: './lista-turno.component.html',
  styleUrls: ['./lista-turno.component.css']
})
export class ListaTurnoTipoComponent implements OnInit, OnDestroy {

  public lstTurnos: TipoTurno[];
  public lstTurnosPaged: TipoTurno[];
  @Output() getTurnoEv = new EventEmitter();
  @ViewChild('paginador') paginador: MatPaginator;

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';

  private endSubs = new Subscription();

  constructor(private turnoSrvc: TipoTurnoService) { }

  ngOnInit() {
    this.loadTurnos();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstTurnos, this.txtFiltro);
      this.length = tmpList.length;
      this.lstTurnosPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstTurnos.length;
      this.lstTurnosPaged = PaginarArray(this.lstTurnos, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  loadTurnos = () => {
    this.turnoSrvc.get().subscribe(lst => {
      if (lst) {
        if (lst.length > 0) {
          this.lstTurnos = lst;
          this.applyFilter();
        }
      }
    });
  }

  getTurno = (obj: TipoTurno) => {
    this.getTurnoEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

}

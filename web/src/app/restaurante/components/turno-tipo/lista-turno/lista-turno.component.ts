import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { PaginarArray, MultiFiltro } from '../../../../shared/global';

import { TipoTurno } from '../../../interfaces/tipo-turno';
import { TipoTurnoService } from '../../../services/tipo-turno.service';

@Component({
  selector: 'app-lista-turno-tipo',
  templateUrl: './lista-turno.component.html',
  styleUrls: ['./lista-turno.component.css']
})
export class ListaTurnoTipoComponent implements OnInit {

  public lstTurnos: TipoTurno[];
  public lstTurnosPaged: TipoTurno[];
  @Output() getTurnoEv = new EventEmitter();

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';

  constructor(private turnoSrvc: TipoTurnoService) { }

  ngOnInit() {
    this.loadTurnos();
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstTurnos, this.txtFiltro);
      this.length = tmpList.length;
      this.lstTurnosPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstTurnos.length;
      this.lstTurnosPaged = PaginarArray(this.lstTurnos, this.pageSize, this.pageIndex + 1);
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
    this.applyFilter();
  }

}

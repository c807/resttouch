import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { Turno } from '../../../interfaces/turno';
import { TurnoService } from '../../../services/turno.service';

@Component({
  selector: 'app-lista-turno',
  templateUrl: './lista-turno.component.html',
  styleUrls: ['./lista-turno.component.css']
})
export class ListaTurnoComponent implements OnInit {

  public lstTurnos: Turno[];
  public lstTurnosPaged: Turno[];
  @Output() getTurnoEv = new EventEmitter();
  @ViewChild('paginador') paginador: MatPaginator;

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';

  constructor(
    private ls: LocalstorageService,
    private turnoSrvc: TurnoService
  ) { }

  ngOnInit() {
    this.loadTurnos();
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
    this.turnoSrvc.get({sede: (+this.ls.get(GLOBAL.usrTokenVar).sede || 0)}).subscribe(lst => {
      if (lst) {
        if (lst.length > 0) {
          this.lstTurnos = lst;
          this.applyFilter();
        }
      }
    });
  }

  getTurno = (obj: any) => {
    this.getTurnoEv.emit({
      turno: obj.turno,
      turno_tipo: obj.turno_tipo.turno_tipo,
      fecha: obj.fecha,
      inicio: obj.inicio,
      fin: obj.fin,
      sede: obj.sede
    });
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

}

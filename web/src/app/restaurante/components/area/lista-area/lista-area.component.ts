import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { GLOBAL, PaginarArray, MultiFiltro } from '../../../../shared/global';

import { Area } from '../../../interfaces/area';
import { AreaService } from '../../../services/area.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-area',
  templateUrl: './lista-area.component.html',
  styleUrls: ['./lista-area.component.css']
})
export class ListaAreaComponent implements OnInit, OnDestroy {

  public lstEntidades: Area[];
  public lstEntidadesPaged: Area[];
  @Output() getEntidadEv = new EventEmitter();
  @ViewChild('paginador') paginador: MatPaginator;

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';

  private endSubs = new Subscription();

  constructor(
    public areaSrvc: AreaService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.loadEntidades();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstEntidades, this.txtFiltro);
      this.length = tmpList.length;
      this.lstEntidadesPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstEntidades.length;
      this.lstEntidadesPaged = PaginarArray(this.lstEntidades, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
			this.paginador.firstPage();
		}
  }

  loadEntidades = () => {
    this.endSubs.add(      
      this.areaSrvc.get({ sede: (this.ls.get(GLOBAL.usrTokenVar).sede || 0), debaja: 1 }).subscribe((lst) => {
        if (lst) {
          if (lst.length > 0) {
            this.lstEntidades = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getEntidad = (id: number) => {
    this.endSubs.add(      
      this.areaSrvc.get({ area: id, debaja: 1 }).subscribe((lst) => {
        if (lst) {
          if (lst.length > 0) {
            this.getEntidadEv.emit(lst[0]);
          }
        }
      })
    );
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }
}

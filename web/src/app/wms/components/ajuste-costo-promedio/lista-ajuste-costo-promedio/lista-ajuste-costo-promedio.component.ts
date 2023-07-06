import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import * as moment from 'moment';

import { AjusteCostoPromedio } from '@wms-interfaces/ajuste-costo-promedio';
import { AjusteCostoPromedioService } from '@wms-services/ajuste-costo-promedio.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-ajuste-costo-promedio',
  templateUrl: './lista-ajuste-costo-promedio.component.html',
  styleUrls: ['./lista-ajuste-costo-promedio.component.css']
})
export class ListaAjusteCostoPromedioComponent implements OnInit, OnDestroy {

  get sedeActual(): number {
    return this.ls.get(GLOBAL.usrTokenVar).sede as number;
  }

  public lstAjustesCostoPromedio: AjusteCostoPromedio[];
  public lstAjustesCostoPromedioPaged: AjusteCostoPromedio[];
  @Output() getAjusteCostoPromedioEv = new EventEmitter();
  @ViewChild('paginador') paginador: MatPaginator;

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';

  public params = {
    fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
    fal: moment().endOf('month').format(GLOBAL.dbDateFormat),
    sede: null
  }

  private endSubs = new Subscription();

  constructor(
    private ajusteCostoPromedioSrvc: AjusteCostoPromedioService,    
    private ls: LocalstorageService,
    // private snackBar: MatSnackBar    
  ) { }

  ngOnInit(): void {
    this.params.sede = this.sedeActual;
    this.loadAjustesCostoPromedio();  
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstAjustesCostoPromedio, this.txtFiltro);
      this.length = tmpList.length;
      this.lstAjustesCostoPromedioPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstAjustesCostoPromedio.length;
      this.lstAjustesCostoPromedioPaged = PaginarArray(this.lstAjustesCostoPromedio, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  loadAjustesCostoPromedio = () => {
    this.ajusteCostoPromedioSrvc.get(this.params).subscribe(lst => {
      this.lstAjustesCostoPromedio = lst;
      this.applyFilter();
    });
  }

  getAjusteCostoPromedio = (obj: any) => {
    this.getAjusteCostoPromedioEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

}

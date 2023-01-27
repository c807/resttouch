import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { TipoMovimiento } from '@wms-interfaces/tipo-movimiento';
import { TipoMovimientoService } from '@wms-services/tipo-movimiento.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-tipo-movimiento',
  templateUrl: './lista-tipo-movimiento.component.html',
  styleUrls: ['./lista-tipo-movimiento.component.css']
})
export class ListaTipoMovimientoComponent implements OnInit, OnDestroy {

  public lstTiposMovimiento: TipoMovimiento[];
  public lstTiposMovimientoPaged: TipoMovimiento[];
  @Output() getTipoMovimientoEv = new EventEmitter();
  @ViewChild('paginador') paginador: MatPaginator;

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;  

  private endSubs = new Subscription();

  constructor(
    private tipoClienteSrvc: TipoMovimientoService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadTiposMovimiento();    
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstTiposMovimiento, this.txtFiltro);
      this.length = tmpList.length;
      this.lstTiposMovimientoPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstTiposMovimiento.length;
      this.lstTiposMovimientoPaged = PaginarArray(this.lstTiposMovimiento, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  loadTiposMovimiento = () => {
    this.endSubs.add(      
      this.tipoClienteSrvc.get().subscribe(lst => {
        if (lst) {
          if (lst.length > 0) {
            this.lstTiposMovimiento = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getTipoMovimiento = (obj: TipoMovimiento) => {
    this.getTipoMovimientoEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

}

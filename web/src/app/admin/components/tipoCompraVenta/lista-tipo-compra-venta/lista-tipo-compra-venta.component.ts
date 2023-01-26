import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { TipoCompraVenta } from '@admin-interfaces/tipo-compra-venta';
import { TipoCompraVentaService } from '@admin-services/tipo-compra-venta.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-tipo-compra-venta',
  templateUrl: './lista-tipo-compra-venta.component.html',
  styleUrls: ['./lista-tipo-compra-venta.component.css']
})
export class ListaTipoCompraVentaComponent implements OnInit, OnDestroy {

  public lstTiposCompraVenta: TipoCompraVenta[];
  public lstTiposCompraVentaPaged: TipoCompraVenta[];
  @Output() getTipoCompraVentaEv = new EventEmitter();

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
    private tipoCompraVentaSrvc: TipoCompraVentaService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadTiposCompraVenta();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstTiposCompraVenta, this.txtFiltro);
      this.length = tmpList.length;
      this.lstTiposCompraVentaPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstTiposCompraVenta.length;
      this.lstTiposCompraVentaPaged = PaginarArray(this.lstTiposCompraVenta, this.pageSize, this.pageIndex + 1);
    }
  }

  loadTiposCompraVenta = () => {
    this.endSubs.add(
      this.tipoCompraVentaSrvc.get().subscribe(lst => {
        this.lstTiposCompraVenta = lst;
        this.applyFilter();        
      })
    );
  }

  getTipoCompraVenta = (obj: TipoCompraVenta) => {
    this.getTipoCompraVentaEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter();
  }

}

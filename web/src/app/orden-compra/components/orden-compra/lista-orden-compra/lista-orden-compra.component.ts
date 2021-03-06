import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { OrdenCompra } from '../../../interfaces/orden-compra';
import { OrdenCompraService } from '../../../services/orden-compra.service';

@Component({
  selector: 'app-lista-orden-compra',
  templateUrl: './lista-orden-compra.component.html',
  styleUrls: ['./lista-orden-compra.component.css']
})
export class ListaOrdenCompraComponent implements OnInit {

  public lstOrdenesCompra: OrdenCompra[];
  public lstOrdenesCompraPaged: OrdenCompra[];
  @Output() getOrdenCompraEv = new EventEmitter();

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  constructor(
    private ordenCompraSrvc: OrdenCompraService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadOrdenesCompra();
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstOrdenesCompra, this.txtFiltro);
      this.length = tmpList.length;
      this.lstOrdenesCompraPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstOrdenesCompra.length;
      this.lstOrdenesCompraPaged = PaginarArray(this.lstOrdenesCompra, this.pageSize, this.pageIndex + 1);
    }
  }

  loadOrdenesCompra = () => {
    this.ordenCompraSrvc.get().subscribe(lst => {
      if (lst) {
        if (lst.length > 0) {
          this.lstOrdenesCompra = lst;
          this.applyFilter();
        }
      }
    });
  }

  getOrdenCompra = (obj: any) => {
    this.getOrdenCompraEv.emit({
      orden_compra: obj.orden_compra,
      proveedor: obj.proveedor || 0,
      fecha: obj.fecha,
      usuario: obj.usuario || 0,
      notas: obj.notas,
      estatus_movimiento: obj.estatus_movimiento || 1
    });
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter();
  }
}

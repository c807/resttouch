import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Proveedor } from '@wms-interfaces/proveedor';
import { ProveedorService } from '@wms-services/proveedor.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-proveedor',
  templateUrl: './lista-proveedor.component.html',
  styleUrls: ['./lista-proveedor.component.css']
})
export class ListaProveedorComponent implements OnInit, OnDestroy {

  public lstProveedores: Proveedor[];
  public lstProveedoresPaged: Proveedor[];
  @Output() getProveedorEv = new EventEmitter();
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
    private proveedorSrvc: ProveedorService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadProveedores();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstProveedores, this.txtFiltro);
      this.length = tmpList.length;
      this.lstProveedoresPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstProveedores.length;
      this.lstProveedoresPaged = PaginarArray(this.lstProveedores, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  loadProveedores = () => {
    this.endSubs.add(      
      this.proveedorSrvc.get().subscribe(lst => {
        if (lst) {
          if (lst.length > 0) {
            this.lstProveedores = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getProveedor = (obj: Proveedor) => this.getProveedorEv.emit(obj);

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }
}

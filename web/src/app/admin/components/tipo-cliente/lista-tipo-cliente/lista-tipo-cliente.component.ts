import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { TipoCliente } from '@admin-interfaces/tipo-cliente';
import { TipoClienteService } from '@admin-services/tipo-cliente.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-tipo-cliente',
  templateUrl: './lista-tipo-cliente.component.html',
  styleUrls: ['./lista-tipo-cliente.component.css']
})
export class ListaTipoClienteComponent implements OnInit, OnDestroy {

  public lstTiposCliente: TipoCliente[];
  public lstTiposClientePaged: TipoCliente[];
  @Output() getTipoClienteEv = new EventEmitter();
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
    private tipoClienteSrvc: TipoClienteService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadTiposCliente();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstTiposCliente, this.txtFiltro);
      this.length = tmpList.length;
      this.lstTiposClientePaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstTiposCliente.length;
      this.lstTiposClientePaged = PaginarArray(this.lstTiposCliente, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  loadTiposCliente = () => {
    this.endSubs.add(
      this.tipoClienteSrvc.get().subscribe(lst => {
        if (lst) {
          if (lst.length > 0) {
            this.lstTiposCliente = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getTipoCliente = (obj: TipoCliente) => {
    this.getTipoClienteEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

}

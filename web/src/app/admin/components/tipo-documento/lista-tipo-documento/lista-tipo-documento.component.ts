import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { TipoDocumento } from '@admin-interfaces/tipo-documento';
import { TipoDocumentoService } from '@admin-services/tipo-documento.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-tipo-documento',
  templateUrl: './lista-tipo-documento.component.html',
  styleUrls: ['./lista-tipo-documento.component.css']
})
export class ListaTipoDocumentoComponent implements OnInit, OnDestroy {

  public lstTiposDocumento: TipoDocumento[];
  public lstTiposDocumentoPaged: TipoDocumento[];
  @Output() getTipoDocumentoEv = new EventEmitter();
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
    private tipoCompraVentaSrvc: TipoDocumentoService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadTiposDocumento();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstTiposDocumento, this.txtFiltro);
      this.length = tmpList.length;
      this.lstTiposDocumentoPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstTiposDocumento.length;
      this.lstTiposDocumentoPaged = PaginarArray(this.lstTiposDocumento, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
			this.paginador.firstPage();
		}
  }

  loadTiposDocumento = () => {
    this.endSubs.add(
      this.tipoCompraVentaSrvc.get().subscribe(lst => {
        this.lstTiposDocumento = lst;
        this.applyFilter();
      })
    );
  }

  getTipoDocumento = (obj: TipoDocumento) => {
    this.getTipoDocumentoEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

}

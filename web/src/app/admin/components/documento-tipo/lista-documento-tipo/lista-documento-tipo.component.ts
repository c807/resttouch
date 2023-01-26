import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { DocumentoTipo } from '@admin-interfaces/documento-tipo';
import { DocumentoTipoService } from '@admin-services/documento-tipo.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-documento-tipo',
  templateUrl: './lista-documento-tipo.component.html',
  styleUrls: ['./lista-documento-tipo.component.css']
})
export class ListaDocumentoTipoComponent implements OnInit, OnDestroy {

  public lstDocumentoTipo: DocumentoTipo[];
  public lstDocumentoTipoPaged: DocumentoTipo[];
  @Output() getDocumentoTipoEv = new EventEmitter();

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
    private tipoCompraVentaSrvc: DocumentoTipoService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadDocumentosTipo();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstDocumentoTipo, this.txtFiltro);
      this.length = tmpList.length;
      this.lstDocumentoTipoPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstDocumentoTipo.length;
      this.lstDocumentoTipoPaged = PaginarArray(this.lstDocumentoTipo, this.pageSize, this.pageIndex + 1);
    }
  }

  loadDocumentosTipo = () => {
    this.endSubs.add(      
      this.tipoCompraVentaSrvc.get().subscribe(lst => {
        if (lst) {
          if (lst.length > 0) {
            this.lstDocumentoTipo = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getDocumentoTipo = (obj: DocumentoTipo) => {
    this.getDocumentoTipoEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter();
  }

}

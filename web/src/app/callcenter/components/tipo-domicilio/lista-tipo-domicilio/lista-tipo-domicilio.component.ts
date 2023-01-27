import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { TipoDomicilio } from '@callcenter-interfaces/tipo-domicilio';
import { TipoDomicilioService } from '@callcenter-services/tipo-domicilio.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-tipo-domicilio',
  templateUrl: './lista-tipo-domicilio.component.html',
  styleUrls: ['./lista-tipo-domicilio.component.css']
})
export class ListaTipoDomicilioComponent implements OnInit, OnDestroy {

  public lstTipoDomicilio: TipoDomicilio[];
  public lstTipoDomicilioPaged: TipoDomicilio[];
  @Output() getTipoDomicilioEv = new EventEmitter();
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
    private tipoDomicilioSrvc: TipoDomicilioService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadTiposDomicilio();    
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstTipoDomicilio, this.txtFiltro);
      this.length = tmpList.length;
      this.lstTipoDomicilioPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstTipoDomicilio.length;
      this.lstTipoDomicilioPaged = PaginarArray(this.lstTipoDomicilio, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  loadTiposDomicilio = () => {
    this.endSubs.add(      
      this.tipoDomicilioSrvc.get().subscribe(lst => {
        this.lstTipoDomicilio = lst;
        this.applyFilter();              
      })
    );
  }

  getTipoDomicilio = (obj: TipoDomicilio) => {
    this.getTipoDomicilioEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

}

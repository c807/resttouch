import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Repartidor } from '@callcenter-interfaces/repartidor';
import { RepartidorService } from '@callcenter-services/repartidor.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-repartidor',
  templateUrl: './lista-repartidor.component.html',
  styleUrls: ['./lista-repartidor.component.css']
})
export class ListaRepartidorComponent implements OnInit, OnDestroy {

  public lstRepartidores: Repartidor[];
  public lstRepartidoresPaged: Repartidor[];
  @Output() getRepartidorEv = new EventEmitter();
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
    private tipoRepartidorSrvc: RepartidorService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadRepartidores();    
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstRepartidores, this.txtFiltro);
      this.length = tmpList.length;
      this.lstRepartidoresPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstRepartidores.length;
      this.lstRepartidoresPaged = PaginarArray(this.lstRepartidores, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  loadRepartidores = () => {
    this.endSubs.add(      
      this.tipoRepartidorSrvc.get().subscribe(lst => {
        this.lstRepartidores = lst;
        this.applyFilter();              
      })
    );
  }

  getRepartidor = (obj: Repartidor) => {
    this.getRepartidorEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

}

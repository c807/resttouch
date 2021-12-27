import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { TipoDireccion } from '../../../interfaces/tipo-direccion';
import { TipoDireccionService } from '../../../services/tipo-direccion.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-tipo-direccion',
  templateUrl: './lista-tipo-direccion.component.html',
  styleUrls: ['./lista-tipo-direccion.component.css']
})
export class ListaTipoDireccionComponent implements OnInit, OnDestroy {

  public lstTipoDireccion: TipoDireccion[];
  public lstTipoDireccionPaged: TipoDireccion[];
  @Output() getTipoDireccionEv = new EventEmitter();
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
    private tipoDireccionSrvc: TipoDireccionService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadTiposDireccion();    
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstTipoDireccion, this.txtFiltro);
      this.length = tmpList.length;
      this.lstTipoDireccionPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstTipoDireccion.length;
      this.lstTipoDireccionPaged = PaginarArray(this.lstTipoDireccion, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  loadTiposDireccion = () => {
    this.endSubs.add(      
      this.tipoDireccionSrvc.get().subscribe(lst => {
        this.lstTipoDireccion = lst;
        this.applyFilter();              
      })
    );
  }

  getTipoDireccion = (obj: TipoDireccion) => {
    this.getTipoDireccionEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }  

}

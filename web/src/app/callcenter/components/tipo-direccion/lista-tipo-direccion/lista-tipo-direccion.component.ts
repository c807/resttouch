import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { TipoDireccion } from '../../../interfaces/tipo-direccion';
import { TipoDireccionService } from '../../../services/tipo-direccion.service';

@Component({
  selector: 'app-lista-tipo-direccion',
  templateUrl: './lista-tipo-direccion.component.html',
  styleUrls: ['./lista-tipo-direccion.component.css']
})
export class ListaTipoDireccionComponent implements OnInit {

  public lstTipoDireccion: TipoDireccion[];
  public lstTipoDireccionPaged: TipoDireccion[];
  @Output() getTipoDireccionEv = new EventEmitter();

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  constructor(
    private tipoDireccionSrvc: TipoDireccionService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadTiposDireccion();    
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstTipoDireccion, this.txtFiltro);
      this.length = tmpList.length;
      this.lstTipoDireccionPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstTipoDireccion.length;
      this.lstTipoDireccionPaged = PaginarArray(this.lstTipoDireccion, this.pageSize, this.pageIndex + 1);
    }
  }

  loadTiposDireccion = () => {
    this.tipoDireccionSrvc.get().subscribe(lst => {
      this.lstTipoDireccion = lst;
      this.applyFilter();              
    });
  }

  getTipoDireccion = (obj: TipoDireccion) => {
    this.getTipoDireccionEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter();
  }  

}

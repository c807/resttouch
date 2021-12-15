import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { TiempoEntrega } from '../../../interfaces/tiempo-entrega';
import { TiempoEntregaService } from '../../../services/tiempo-entrega.service';

@Component({
  selector: 'app-lista-tiempo-entrega',
  templateUrl: './lista-tiempo-entrega.component.html',
  styleUrls: ['./lista-tiempo-entrega.component.css']
})
export class ListaTiempoEntregaComponent implements OnInit {

  public lstTiemposEntrega: TiempoEntrega[];
  public lstTiemposEntregaPaged: TiempoEntrega[];
  @Output() getTiempoEntregaEv = new EventEmitter();

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  constructor(
    private tiempoEntregaSrvc: TiempoEntregaService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadTiemposEntrega();    
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstTiemposEntrega, this.txtFiltro);
      this.length = tmpList.length;
      this.lstTiemposEntregaPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstTiemposEntrega.length;
      this.lstTiemposEntregaPaged = PaginarArray(this.lstTiemposEntrega, this.pageSize, this.pageIndex + 1);
    }
  }

  loadTiemposEntrega = () => {
    this.tiempoEntregaSrvc.get().subscribe(lst => {
      this.lstTiemposEntrega = lst;
      this.applyFilter();              
    });
  }

  getTiempoEntrega = (obj: TiempoEntrega) => {
    this.getTiempoEntregaEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter();
  }  

}

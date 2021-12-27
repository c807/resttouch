import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { EstatusCallcenter } from '../../../interfaces/estatus-callcenter';
import { EstatusCallcenterService } from '../../../services/estatus-callcenter.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-estatus-callcenter',
  templateUrl: './lista-estatus-callcenter.component.html',
  styleUrls: ['./lista-estatus-callcenter.component.css']
})
export class ListaEstatusCallcenterComponent implements OnInit, OnDestroy {

  public lstEstatusCallcenter: EstatusCallcenter[];
  public lstEstatusCallcenterPaged: EstatusCallcenter[];
  @Output() getEstatusCallcenterEv = new EventEmitter();
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
    private estatusCallcenterSrvc: EstatusCallcenterService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadEstatuscallcenter();        
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstEstatusCallcenter, this.txtFiltro);
      this.length = tmpList.length;
      this.lstEstatusCallcenterPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstEstatusCallcenter.length;
      this.lstEstatusCallcenterPaged = PaginarArray(this.lstEstatusCallcenter, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  loadEstatuscallcenter = () => {
    this.endSubs.add(      
      this.estatusCallcenterSrvc.get().subscribe(lst => {
        this.lstEstatusCallcenter = lst;
        this.applyFilter();              
      })
    );
  }

  getEstatusCallcenter = (obj: EstatusCallcenter) => {
    this.getEstatusCallcenterEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }  

}

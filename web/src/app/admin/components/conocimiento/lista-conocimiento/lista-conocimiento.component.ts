import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Conocimiento } from '@admin-interfaces/conocimiento';
import { ConocimientoService } from '@admin-services/conocimiento.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-conocimiento',
  templateUrl: './lista-conocimiento.component.html',
  styleUrls: ['./lista-conocimiento.component.css']
})
export class ListaConocimientoComponent implements OnInit, OnDestroy {

  public lstConocimiento: Conocimiento[];
  public lstConocimientoPaged: Conocimiento[];
  @Output() getConocimientoEv = new EventEmitter();

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
    private conocimientoSrvc: ConocimientoService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadConocimiento();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstConocimiento, this.txtFiltro);
      this.length = tmpList.length;
      this.lstConocimientoPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstConocimiento.length;
      this.lstConocimientoPaged = PaginarArray(this.lstConocimiento, this.pageSize, this.pageIndex + 1);
    }
  }

  loadConocimiento = () => {
    this.endSubs.add(      
      this.conocimientoSrvc.get().subscribe(lst => {
        this.lstConocimiento = lst;
        this.applyFilter();
      })
    );
  }

  getConocimiento = (obj: Conocimiento) => {
    this.getConocimientoEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter();
  }

}

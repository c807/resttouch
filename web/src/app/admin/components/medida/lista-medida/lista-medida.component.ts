import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Medida } from '@admin-interfaces/medida';
import { MedidaService } from '@admin-services/medida.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-medida',
  templateUrl: './lista-medida.component.html',
  styleUrls: ['./lista-medida.component.css']
})
export class ListaMedidaComponent implements OnInit, OnDestroy {

  public lstMedidas: Medida[];
  public lstMedidasPaged: Medida[];
  @Output() getMedidaEv = new EventEmitter();

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
    private medidaSrvc: MedidaService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadMedidas();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstMedidas, this.txtFiltro);
      this.length = tmpList.length;
      this.lstMedidasPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstMedidas.length;
      this.lstMedidasPaged = PaginarArray(this.lstMedidas, this.pageSize, this.pageIndex + 1);
    }
  }

  loadMedidas = () => {
    this.endSubs.add(      
      this.medidaSrvc.get().subscribe(lst => {
        if (lst) {
          if (lst.length > 0) {
            this.lstMedidas = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getMedida = (obj: Medida) => {
    this.getMedidaEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter();
  }

}

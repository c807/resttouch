import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { ImpuestoEspecial } from '@admin-interfaces/impuesto-especial';
import { ImpuestoEspecialService } from '@admin-services/impuesto-especial.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-impuesto-especial',
  templateUrl: './lista-impuesto-especial.component.html',
  styleUrls: ['./lista-impuesto-especial.component.css']
})
export class ListaImpuestoEspecialComponent implements OnInit, OnDestroy {

  public lstImpuestosEspeciales: ImpuestoEspecial[];
  public lstImpuestosEspecialesPaged: ImpuestoEspecial[];
  @Output() getImpuestoEspecialEv = new EventEmitter();
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
    private impuestoEspcialSrvc: ImpuestoEspecialService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadImpuestosEspeciales();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstImpuestosEspeciales, this.txtFiltro);
      this.length = tmpList.length;
      this.lstImpuestosEspecialesPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstImpuestosEspeciales.length;
      this.lstImpuestosEspecialesPaged = PaginarArray(this.lstImpuestosEspeciales, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  loadImpuestosEspeciales = () => {
    this.endSubs.add(      
      this.impuestoEspcialSrvc.get().subscribe(lst => {
        if (lst) {
          if (lst.length > 0) {
            this.lstImpuestosEspeciales = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getImpuestoEspecial = (obj: ImpuestoEspecial) => {
    this.getImpuestoEspecialEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

}

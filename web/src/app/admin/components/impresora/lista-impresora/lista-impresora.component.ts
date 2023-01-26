import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Impresora } from '@admin-interfaces/impresora';
import { ImpresoraService } from '@admin-services/impresora.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-impresora',
  templateUrl: './lista-impresora.component.html',
  styleUrls: ['./lista-impresora.component.css']
})
export class ListaImpresoraComponent implements OnInit, OnDestroy {

  public lstImpresoras: Impresora[];
  public lstImpresorasPaged: Impresora[];
  @Output() getImpresoraEv = new EventEmitter();
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
    private impresoraSrvc: ImpresoraService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadImpresoras();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstImpresoras, this.txtFiltro);
      this.length = tmpList.length;
      this.lstImpresorasPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstImpresoras.length;
      this.lstImpresorasPaged = PaginarArray(this.lstImpresoras, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
			this.paginador.firstPage();
		}
  }

  loadImpresoras = () => {
    this.endSubs.add(      
      this.impresoraSrvc.get().subscribe(lst => {
        if (lst) {
          if (lst.length > 0) {
            this.lstImpresoras = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getImpresora = (obj: Impresora) => {
    this.getImpresoraEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }
}

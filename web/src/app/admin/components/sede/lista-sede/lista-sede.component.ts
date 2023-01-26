import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { PaginarArray, MultiFiltro } from '@shared/global';

import { Sede, Empresa } from '@admin-interfaces/sede';
import { SedeService } from '@admin-services/sede.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-sede',
  templateUrl: './lista-sede.component.html',
  styleUrls: ['./lista-sede.component.css']
})
export class ListaSedeComponent implements OnInit, OnDestroy {

  @Input() empresa: Empresa;
  public listaSede: Sede[];
  public listaSedePaged: Sede[];
  @Output() getSedeEv = new EventEmitter();
  @ViewChild('paginador') paginador: MatPaginator;

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';

  private endSubs = new Subscription();

  constructor(
    private sedeSrv: SedeService
  ) { }

  ngOnInit() {
    this.getSedes();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.listaSede, this.txtFiltro);
      this.length = tmpList.length;
      this.listaSedePaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.listaSede.length;
      this.listaSedePaged = PaginarArray(this.listaSede, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina && this.paginador) {
      this.paginador.firstPage();
    }
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

  getSedes = () => {
    this.listaSede = []
    this.applyFilter();
    this.endSubs.add(      
      this.sedeSrv.get({ empresa: this.empresa.empresa }).subscribe((lst: Sede[]) => {
        if (lst) {
          if (lst.length > 0) {
            this.listaSede = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getSede = (obj: Sede) => {
    this.getSedeEv.emit(obj);
  }

}

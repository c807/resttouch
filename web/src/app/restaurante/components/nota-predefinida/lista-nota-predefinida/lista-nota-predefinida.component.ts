import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { NotaPredefinida } from '../../../interfaces/nota-predefinida';
import { NotaPredefinidaService } from '../../../services/nota-predefinida.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-nota-predefinida',
  templateUrl: './lista-nota-predefinida.component.html',
  styleUrls: ['./lista-nota-predefinida.component.css']
})
export class ListaNotaPredefinidaComponent implements OnInit, OnDestroy {

  public lstNotasPredefinidas: NotaPredefinida[];
  public lstNotasPredefinidasPaged: NotaPredefinida[];
  @Output() getNotaPredefinidaEv = new EventEmitter();
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
    private notaPredefinidaSrvc: NotaPredefinidaService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadNotasPredefinidas();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstNotasPredefinidas, this.txtFiltro);
      this.length = tmpList.length;
      this.lstNotasPredefinidasPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstNotasPredefinidas.length;
      this.lstNotasPredefinidasPaged = PaginarArray(this.lstNotasPredefinidas, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
			this.paginador.firstPage();
		}
  }

  loadNotasPredefinidas = () => {
    this.endSubs.add(
      this.notaPredefinidaSrvc.get().subscribe(lst => {
        this.lstNotasPredefinidas = lst;
        this.applyFilter();
      })
    );
  }

  getNotaPredefinida = (obj: NotaPredefinida) => {
    this.getNotaPredefinidaEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }  

}

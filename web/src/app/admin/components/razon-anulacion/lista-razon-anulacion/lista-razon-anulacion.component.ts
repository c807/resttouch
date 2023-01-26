import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { AnulacionService } from '@admin-services/anulacion.service';
import { RazonAnulacion } from '@admin-interfaces/razon-anulacion';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-razon-anulacion',
  templateUrl: './lista-razon-anulacion.component.html',
  styleUrls: ['./lista-razon-anulacion.component.css']
})
export class ListaRazonAnulacionComponent implements OnInit, OnDestroy {

  public listaRazonAnulacion: RazonAnulacion[];
  public listaRazonAnulacionPaged: RazonAnulacion[];
  @Output() getRazonAnulacionEv = new EventEmitter();
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
    private srvAnulacion: AnulacionService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.getRazones();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  getRazones = () => {
    this.endSubs.add(      
      this.srvAnulacion.get().subscribe((res: RazonAnulacion[]) => {
        this.listaRazonAnulacion = res;
        this.applyFilter();
      })
    );
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.listaRazonAnulacion, this.txtFiltro);
      this.length = tmpList.length;
      this.listaRazonAnulacionPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.listaRazonAnulacion.length;
      this.listaRazonAnulacionPaged = PaginarArray(this.listaRazonAnulacion, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  getRazonAnulacion = (obj: RazonAnulacion) => {
    this.getRazonAnulacionEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

}

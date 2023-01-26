import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { FormaPago } from '@admin-interfaces/forma-pago';
import { FpagoService } from '@admin-services/fpago.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-pago',
  templateUrl: './lista-pago.component.html',
  styleUrls: ['./lista-pago.component.css']
})
export class ListaPagoComponent implements OnInit, OnDestroy {

  public listaFpago: FormaPago[];
  public listaFpagoPaged: FormaPago[];
  @Output() getFpagoEv = new EventEmitter();
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
    private fpagoSrvc: FpagoService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.getFormasPago();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.listaFpago, this.txtFiltro);
      this.length = tmpList.length;
      this.listaFpagoPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.listaFpago.length;
      this.listaFpagoPaged = PaginarArray(this.listaFpago, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  getFormasPago = () => {
    this.endSubs.add(      
      this.fpagoSrvc.get().subscribe((lst: FormaPago[]) => {
        if (lst) {
          if (lst.length > 0) {
            lst = lst.map(fp => {
              fp.pedirdocumento = +fp.pedirdocumento;
              fp.adjuntararchivo = +fp.adjuntararchivo;
              fp.pedirautorizacion = +fp.pedirautorizacion;
              fp.sinfactura = +fp.sinfactura;
              fp.activo = +fp.activo;
              fp.escobrohabitacion = +fp.escobrohabitacion;
              return fp;
            });
            this.listaFpago = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getFpago = (obj: FormaPago) => {
    this.getFpagoEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }
}

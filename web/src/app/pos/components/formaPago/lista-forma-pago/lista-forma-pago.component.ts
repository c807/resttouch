import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { PaginarArray, MultiFiltro } from '@shared/global';

import { FormaPago } from '@pos-interfaces/forma-pago';
import { FormaPagoService } from '@pos-services/forma-pago.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-forma-pago',
  templateUrl: './lista-forma-pago.component.html',
  styleUrls: ['./lista-forma-pago.component.css']
})
export class ListaFormaPagoComponent implements OnInit, OnDestroy {

  public lstFormasPago: FormaPago[];
  public lstFormasPagoPaged: FormaPago[];
  @Output() getFormaPagoEv = new EventEmitter();

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';

  private endSubs = new Subscription();

  constructor(
    private formaPagoSrvc: FormaPagoService
  ) { }

  ngOnInit() {
    this.loadFormasPago();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstFormasPago, this.txtFiltro);
      this.length = tmpList.length;
      this.lstFormasPagoPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstFormasPago.length;
      this.lstFormasPagoPaged = PaginarArray(this.lstFormasPago, this.pageSize, this.pageIndex + 1);
    }
  }

  loadFormasPago = () => {
    this.endSubs.add(      
      this.formaPagoSrvc.buscar().subscribe(lst => {
        if (lst) {
          if (lst.length > 0) {
            this.lstFormasPago = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getFormaPago = (obj: FormaPago) => {
    this.getFormaPagoEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter();
  }
}

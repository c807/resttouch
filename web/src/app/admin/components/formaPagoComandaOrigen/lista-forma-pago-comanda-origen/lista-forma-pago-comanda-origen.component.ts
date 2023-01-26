import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { FormaPagoComandaOrigenResponse } from '@admin-interfaces/forma-pago';
import { FpagoService } from '@admin-services/fpago.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-forma-pago-comanda-origen',
  templateUrl: './lista-forma-pago-comanda-origen.component.html',
  styleUrls: ['./lista-forma-pago-comanda-origen.component.css']
})
export class ListaFormaPagoComandaOrigenComponent implements OnInit, OnDestroy {

  @Input() comanda_origen: number = null;
  @Output() getFormaPagoComandaOrigenEv = new EventEmitter();
  @ViewChild('paginador') paginador: MatPaginator;
  public lstFormasPagoComandaOrigen: FormaPagoComandaOrigenResponse[];
  public lstFormasPagoComandaOrigenPaged: FormaPagoComandaOrigenResponse[];

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

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadFormasPagoComandaOrigen();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstFormasPagoComandaOrigen, this.txtFiltro);
      this.length = tmpList.length;
      this.lstFormasPagoComandaOrigenPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstFormasPagoComandaOrigen.length;
      this.lstFormasPagoComandaOrigenPaged = PaginarArray(this.lstFormasPagoComandaOrigen, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
			this.paginador.firstPage();
		}
  }

  loadFormasPagoComandaOrigen = () => {
    const fltr = {
      comanda_origen: null
    };

    if (this.comanda_origen) {
      fltr.comanda_origen = this.comanda_origen;
    } else {
      delete(fltr.comanda_origen);
    }

    this.endSubs.add(      
      this.fpagoSrvc.getFormaPagoComandaOrigen(fltr).subscribe(lst => {
        if (lst) {
          if (lst.length > 0) {
            this.lstFormasPagoComandaOrigen = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getFPComandaOrigen = (obj: FormaPagoComandaOrigenResponse) => {
    this.getFormaPagoComandaOrigenEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

}

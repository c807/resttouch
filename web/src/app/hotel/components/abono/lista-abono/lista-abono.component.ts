import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { GLOBAL, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { IDataAbono } from '@hotel/interfaces/abono';
import { Abono } from '@hotel/interfaces/abono';
import { AbonoService } from '@hotel/services/abono.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-abono',
  templateUrl: './lista-abono.component.html',
  styleUrls: ['./lista-abono.component.css']
})
export class ListaAbonoComponent implements OnInit, OnDestroy {

  @Input() data: IDataAbono = null;
  @Output() getAbonoEv = new EventEmitter();
  public infoAbono: IDataAbono = null;
  public lstAbonos: Abono[] = [];
  public lstAbonosOriginal: Abono[] = [];
  public txtFiltro = '';
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    private ls: LocalstorageService,
    private abonoSrvc: AbonoService,
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    if (this.data) {
      this.infoAbono = JSON.parse(JSON.stringify(this.data));
    }
    this.loadAbonos();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadAbonos = () => {
    this.cargando = true;

    const fltr: any = { _fulldata: 1 };

    if (this.infoAbono?.reserva && +this.infoAbono?.reserva > 0) {
      fltr.reserva = +this.infoAbono.reserva;
    }

    if (this.infoAbono?.factura && +this.infoAbono?.factura > 0) {
      fltr.reserva = +this.infoAbono.factura;
    }

    this.endSubs.add(
      this.abonoSrvc.get(fltr).subscribe(res => {
        this.lstAbonos = res;
        this.lstAbonosOriginal = JSON.parse(JSON.stringify(this.lstAbonos));
        this.cargando = false;
      })
    );
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstAbonosOriginal, this.txtFiltro);
      this.lstAbonos = JSON.parse(JSON.stringify(tmpList));
    } else {
      this.lstAbonos = JSON.parse(JSON.stringify(this.lstAbonosOriginal));
    }
  }

  getAbono = (obj: Abono) => {
    this.getAbonoEv.emit(obj);
  }

}

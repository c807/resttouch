import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import * as moment from 'moment';
import { saveAs } from 'file-saver';

import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { Egreso } from '@wms-interfaces/egreso';
import { EgresoService } from '@wms-services/egreso.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-egreso',
  templateUrl: './lista-egreso.component.html',
  styleUrls: ['./lista-egreso.component.css']
})
export class ListaEgresoComponent implements OnInit, OnDestroy {

  public lstEgresos: Egreso[];
  public lstEgresosPaged: Egreso[];
  @Output() getEgresoEv = new EventEmitter();  
  
  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public params = {
    _fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
    _fal: moment().endOf('month').format(GLOBAL.dbDateFormat),
    _solo_requisiciones: 0
  }
  public esRequisicion = false;

  private endSubs = new Subscription();

  constructor(
    private egresoSrvc: EgresoService,
    private ls: LocalstorageService,
    private pdfServicio: ReportePdfService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    // this.loadEgresos();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstEgresos, this.txtFiltro);
      this.length = tmpList.length;
      this.lstEgresosPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstEgresos.length;
      this.lstEgresosPaged = PaginarArray(this.lstEgresos, this.pageSize, this.pageIndex + 1);
    }
  }

  loadEgresos = () => {
    if (this.esRequisicion) {
      this.params._solo_requisiciones = 1;
    }
    this.egresoSrvc.get(this.params).subscribe(lst => {
      this.lstEgresos = lst;
      this.applyFilter();      
    });
  }

  getEgreso = (obj: any) => {    
    this.getEgresoEv.emit({
      egreso: obj.egreso,
      tipo_movimiento: obj.tipo_movimiento.tipo_movimiento,
      bodega: obj.bodega.bodega,
      fecha: obj.fecha,
      usuario: obj.usuario.usuario,
      estatus_movimiento: obj.estatus_movimiento || 1,
      traslado: obj.traslado || 0,
      idcomandafox: obj.idcomandafox,
      bodega_destino: obj.bodega_destino,
      comentario: obj.comentario
    });
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter();
  }

  descargar = () => {
    const filtros = {
      sede: (+this.ls.get(GLOBAL.usrTokenVar).sede || 0),
      fdel: this.params._fdel,
      fal: this.params._fal,
      filtro: null
    }

    if (this.txtFiltro.length > 0) {
      filtros.filtro = this.txtFiltro;
    } else {
      delete filtros.filtro;
    }

    this.endSubs.add(
      this.pdfServicio.getDumpEgresos(filtros).subscribe(res => {
        if (res) {
          const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
          saveAs(blob, `Egresos_${moment().format(GLOBAL.dateTimeFormatRptName)}.xls`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Egresos', { duration: 3000 });
        }        
      })
    );
  }

}

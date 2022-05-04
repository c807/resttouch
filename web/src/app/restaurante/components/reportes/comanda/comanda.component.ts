import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { ReportePdfService } from '../../../services/reporte-pdf.service';
import { ConfiguracionBotones } from '../../../../shared/interfaces/config-reportes';
import { FormaPago } from '../../../../admin/interfaces/forma-pago';
import { FpagoService } from '../../../../admin/services/fpago.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comanda',
  templateUrl: './comanda.component.html',
  styleUrls: ['./comanda.component.css']
})
export class ComandaComponent implements OnInit, OnDestroy {

  public params: any = {};
  public cargando = false;
  public configBotones: ConfiguracionBotones = {
    showPdf: false, showHtml: false, showExcel: true, isExcelDisabled: false
  };

  public formasPago: FormaPago[] = [];

  public tiposDeFecha = [
    { tipo_fecha: 1, descripcion: 'Comanda' },
    { tipo_fecha: 2, descripcion: 'Turno' },
    { tipo_fecha: 3, descripcion: 'Inicio de turno' },
    { tipo_fecha: 4, descripcion: 'Fin de turno' }
  ];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private fPagoSrvc: FpagoService
  ) { }

  ngOnInit(): void {    
    this.resetParams();
    this.loadFormasPago();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetParams = () => {
    this.params = {
      fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat),
      ver_detalle_comanda: 1,
      activos: 1,
      ver_forma_pago: 1,
      ver_facturas: 1,
      ver_detalle_facturas: 1,
      tipo_fecha: 1,
      comandas: null,
      formas_pago: []
    };
  }

  chkDates = () => {
    this.configBotones.isExcelDisabled = (!this.params.fdel || !this.params.fal);
  }

  validateKey = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[0-9,]/.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

  loadFormasPago = () => {
    this.endSubs.add(
      this.fPagoSrvc.get().subscribe(res => this.formasPago = res)
    );
  }

  mcbChangeFP = () => {
    if (+this.params.ver_forma_pago === 0) {
      this.params.formas_pago = [];
    }
  }

  excelClick = () => {
    console.log(this.params);
    this.cargando = true;    
    this.pdfServicio.getReporteComandas(this.params).subscribe(res => {
      this.cargando = false;
      if (res) {
        const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
        saveAs(blob, `Comandas_${moment().format(GLOBAL.dateTimeFormatRptName)}.xls`);
      } else {
        this.snackBar.open('No se pudo generar el reporte...', 'Comandas', { duration: 3000 });
      }
    });
  }
}

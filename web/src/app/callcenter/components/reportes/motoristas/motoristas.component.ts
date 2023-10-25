import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { RtpPedidosService } from '@callcenter-services/rtp_pedidos.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-motoristas',
  templateUrl: './motoristas.component.html',
  styleUrls: ['./motoristas.component.css']
})
export class MotoristasComponent implements OnInit, OnDestroy {

  get configBotones() {
    const deshabilitar = !moment(this.params.fdel).isValid() || !moment(this.params.fal).isValid();
    return {
      showPdf: true, showHtml: false, showExcel: true,
      isPdfDisabled: deshabilitar,
      isExcelDisabled: deshabilitar
    }
  };

  public params: any = {};
  public cargando = false;
  public archivo_pdf: string = null;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private rptVentasSrvc: RtpPedidosService,
  ) { }

  ngOnInit(): void {
    this.resetParams();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetParams = () => {
    this.params = {
      _fdel: moment().startOf('week').format(GLOBAL.dbDateFormat),
      _fal: moment().format(GLOBAL.dbDateFormat)
    };
    this.archivo_pdf = null;
    this.cargando = false;
  }

  genReporte = (esExcel = 0) => {
    this.cargando = true;
    if (+esExcel === 1) {
      this.params._excel = 1;
    }

    this.endSubs.add(
      this.rptVentasSrvc.motoristas(this.params).subscribe(res => {
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
          if (+esExcel === 0) {
            this.archivo_pdf = URL.createObjectURL(blob);
          } else {
            saveAs(blob, `Motoristas_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
          }
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Reporte de motoristas.', { duration: 3000 });
        }
      })
    );
  }

}

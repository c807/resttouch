import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { ConfiguracionBotones } from '@shared/interfaces/config-reportes';
import { UsuarioSede } from '@admin-interfaces/acceso';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-articulos-eliminados',
  templateUrl: './articulos-eliminados.component.html',
  styleUrls: ['./articulos-eliminados.component.css']
})
export class ArticulosEliminadosComponent implements OnInit, OnDestroy {

  public params: any = {};
  public cargando = false;
  public sedes: UsuarioSede[] = [];
  public configBotones: ConfiguracionBotones = {
    showPdf: false, showHtml: false, showExcel: true, isExcelDisabled: false
  };

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private sedeSrvc: AccesoUsuarioService
  ) { }

  ngOnInit(): void {
    this.resetParams();
    this.loadSedes();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadSedes = () => {
    this.cargando = true;
    this.endSubs.add(
      this.sedeSrvc.getSedes({ reporte: true }).subscribe(res => {
        this.sedes = res;
        this.cargando = false;
      })
    );
  }

  resetParams = () => {
    this.params = {
      fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat),
      comandas: null,
      usuario: null,
      sede: null,
      articulo: null
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

  excelClick = () => {
    this.cargando = true;
    this.pdfServicio.getReporteArticulosEliminados(this.params).subscribe(res => {
      this.cargando = false;
      if (res) {
        const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
        saveAs(blob, `Articulos_Eliminados_${moment().format(GLOBAL.dateTimeFormatRptName)}.xls`);
      } else {
        this.snackBar.open('No se pudo generar el reporte...', 'Artículos eliminados de comanda', { duration: 3000 });
      }
    });
  }

}

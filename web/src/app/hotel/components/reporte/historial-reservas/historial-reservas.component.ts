import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';
import { UsuarioSede } from '@admin-interfaces/acceso';
import { ConfiguracionBotones } from '@shared-interfaces/config-reportes';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-historial-reservas',
  templateUrl: './historial-reservas.component.html',
  styleUrls: ['./historial-reservas.component.css']
})
export class HistorialReservasComponent implements OnInit {

  public sedes: UsuarioSede[] = [];
  public params: any = {};
  public titulo: string = 'Historial_reservas';
  public cargando = false;
  public configBotones: ConfiguracionBotones = {
    showPdf: true, showHtml: false, showExcel: true
  };

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private sedeSrvc: AccesoUsuarioService
  ) { }

  ngOnInit(): void {
    this.resetParams();
    this.loadSedesUsuario();
  }

  loadSedesUsuario = () => {
    this.cargando = true;
    this.endSubs.add(
      this.sedeSrvc.getSedes().subscribe(res => {
        this.sedes = res;
        this.cargando = false;
      })
    )
  };

  resetParams = () => {
    this.params = {
      fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat),
      sede: null,
      topn: null
    };
    this.cargando = false;
  }

  onSubmit(esExcel = 0) {
    this.params._excel = esExcel;
    this.cargando = true;
    this.endSubs.add(
      this.pdfServicio.getHistorialReservas(this.params).subscribe(res => {
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
          saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
        }
      })
    );
  }

}

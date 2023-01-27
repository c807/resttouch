import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { AutoconsultaService } from '@restaurante-services/autoconsulta.service';
import { Campo } from '@restaurante-interfaces/autoconsulta';
import { ConfiguracionBotones } from '@shared-interfaces/config-reportes';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-autoconsulta',
  templateUrl: './autoconsulta.component.html',
  styleUrls: ['./autoconsulta.component.css']
})
export class AutoconsultaComponent implements OnInit, OnDestroy {

  public params: any = {
    fdel: moment().format(GLOBAL.dbDateFormat),
    fal: moment().format(GLOBAL.dbDateFormat),
    campos: [],
    datos: []
  };

  public titulo = 'Autoconsulta';
  public campos: Campo[] = [];
  public fechas: Campo[] = [];
  public orden: Campo[] = [];
  public cargando = false;

  private endSubs = new Subscription();

  configBotones = (isFormValid) => {
    const configBotones: ConfiguracionBotones = {
      showPdf: false, showHtml: false, showExcel: true, isExcelDisabled: !isFormValid
    };
    return configBotones;
  }

  constructor(
    private snackBar: MatSnackBar,
    // private pdfServicio: ReportePdfService,
    private autoconsultaSrvc: AutoconsultaService
  ) {
  }

  ngOnInit() {
    this.getCampos();
    this.getCampos({ por_fecha: 1 }, 2);
    this.getCampos({ ordenar_por: 1 }, 3);
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetParams = () => {
    this.params = {
      fdel: moment().format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat), campos: [], datos: []
    };
    this.cargando = false;
  }

  getReporte = () => {
    this.cargando = true;
    // tslint:disable-next-line: forin
    for (const key in this.params.campos) {
      this.params.datos.push(this.params.campos[key]);
    }
    this.endSubs.add(
      this.autoconsultaSrvc.getReporte(this.params).subscribe(res => {
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
          saveAs(blob, `${this.titulo}.xls`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
        }
      })
    );
  }

  getCampos = (params: any = {}, tipo: number = 1) => {
    this.cargando = true;
    this.endSubs.add(
      this.autoconsultaSrvc.getCampos(params).subscribe(res => {
        this.cargando = false;
        switch (tipo) {
          case 1:
            this.campos = res;
            break;
          case 2:
            this.fechas = res;
            break;
          case 3:
            this.orden = res;
            break;
        }
      })
    );
  }
}

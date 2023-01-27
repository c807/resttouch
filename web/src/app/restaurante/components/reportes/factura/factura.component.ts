import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { saveAs } from 'file-saver';
import { ConfiguracionBotones } from '@shared-interfaces/config-reportes';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { UsuarioSede } from '@admin-interfaces/acceso';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.css']
})
export class FacturaComponent implements OnInit, OnDestroy {
  public params: any = {};
  public titulo = 'Facturas';
  public cargando = false;
  public sedes: UsuarioSede[] = [];
  public configBotones: ConfiguracionBotones = {
    showPdf: true, showHtml: false, showExcel: true, isPdfDisabled: false, isExcelDisabled: false
  };

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private sedeSrvc: AccesoUsuarioService
  ) { }

  ngOnInit() {
    this.resetParams();
    this.loadSedes();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadSedes = () => {
    this.cargando = true;
    this.endSubs.add(
      this.sedeSrvc.getSedes({reporte: true}).subscribe(res => {
        this.sedes = res;
        this.cargando = false;
      })
    );
  }

  resetParams = () => {
    this.params = {
      fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat),
      sede: null
    };
    this.cargando = false;
  }

  onSubmit() {
    this.cargando = true;
    this.params._excel = 0;
    this.endSubs.add(      
      this.pdfServicio.getReporteFactura(this.params).subscribe(res => {
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], { type: 'application/pdf' });
          saveAs(blob, `${this.titulo}.pdf`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
        }
      })
    );
  }

  excelClick() {
    this.cargando = true;
    this.params._excel = 1;
    this.endSubs.add(      
      this.pdfServicio.getReporteFactura(this.params).subscribe(res => {
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

  chkDates = () => {
    this.configBotones.isPdfDisabled = (!this.params.fdel || !this.params.fal);
    this.configBotones.isExcelDisabled = (!this.params.fdel || !this.params.fal);
  }
}

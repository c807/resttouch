import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportePdfService } from '../../../../restaurante/services/reporte-pdf.service';
import { AccesoUsuarioService } from '../../../../admin/services/acceso-usuario.service';
import { Bodega } from '../../../interfaces/bodega';
import { BodegaService } from '../../../services/bodega.service';
import { UsuarioSede } from '../../../../admin/interfaces/acceso';
import { ConfiguracionBotones } from '../../../../shared/interfaces/config-reportes';
import { saveAs } from 'file-saver';
import { GLOBAL } from '../../../../shared/global';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-existencias',
  templateUrl: './existencias.component.html',
  styleUrls: ['./existencias.component.css']
})

export class ExistenciasComponent implements OnInit, OnDestroy {

  public bodegas: Bodega[] = [];
  public sedes: UsuarioSede[] = [];
  public params: any = {};
  public titulo: string = "Existencias";
  public cargando = false;
  public configBotones: ConfiguracionBotones = {
    showPdf: true, showHtml: false, showExcel: true
  };

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private sedeSrvc: AccesoUsuarioService,
    private bodegaSrvc: BodegaService
  ) { }

  ngOnInit() {
    this.params.fecha = moment().format(GLOBAL.dbDateFormat);
    this.params.solo_bajo_minimo = 0;
    this.getSede();
    //this.getBodega();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  getSede = (params: any = {}) => {
    this.endSubs.add(
      this.sedeSrvc.getSedes(params).subscribe(res => {
        this.sedes = res;
      })
    );
  }

  getBodega = (params: any = {}) => {
    this.endSubs.add(
      this.bodegaSrvc.get(params).subscribe(res => {
        this.bodegas = res;
      })
    );
  }

  onSubmit(esExcel = 0) {
    if (this.params.sede && this.params.bodega && this.params.sede.length > 0 && this.params.bodega.length > 0 && this.params.fecha && moment(this.params.fecha).isValid()) {
      this.params.solo_bajo_minimo = this.params.solo_bajo_minimo ? 1 : 0;
      this.params._excel = esExcel;
      this.cargando = true;
      this.endSubs.add(
        this.pdfServicio.getReporteExistencia(this.params).subscribe(res => {
          this.cargando = false;
          if (res) {
            const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
            saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
          } else {
            this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
          }
        })
      );
    } else {
      this.snackBar.open('Por favor ingrese todos los parámetros.', 'Existencias', { duration: 7000 });
    }
  }

  onSedesSelected = (obj: any) => {
    this.getBodega({ sede: this.params.sede });
  }

  resetParams = () => {
    this.params = {
      fecha: moment().format(GLOBAL.dbDateFormat),
      solo_bajo_minimo: 0
    };
    this.cargando = false;
  }

}

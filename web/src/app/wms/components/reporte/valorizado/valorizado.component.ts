import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';
import { GLOBAL, openInNewTab } from '@shared/global';
import * as moment from 'moment';

import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';
import { Bodega } from '@wms-interfaces/bodega';
import { BodegaService } from '@wms-services/bodega.service';
import { UsuarioSede } from '@admin-interfaces/acceso';
import { ConfiguracionBotones } from '@shared-interfaces/config-reportes';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-valorizado',
  templateUrl: './valorizado.component.html',
  styleUrls: ['./valorizado.component.css']
})
export class ValorizadoComponent implements OnInit, OnDestroy {

  public bodegas: Bodega[] = [];
  public sedes: UsuarioSede[] = [];
  public params: any = {};
  public titulo: string = 'Valorizado';
  public cargando = false;
  public configBotones: ConfiguracionBotones = {
    showPdf: true, showHtml: false, showExcel: true
  };
  // public archivo_pdf: string = null;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private sedeSrvc: AccesoUsuarioService,
    private bodegaSrvc: BodegaService
  ) { }

  ngOnInit() {
    this.params.fecha = moment().format(GLOBAL.dbDateFormat);
    this.params._coniva = '0';
    this.params._sinconfirmar = '0';
    this.getSede();
    this.getBodega();
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
      this.params._excel = esExcel;
      this.cargando = true;
      this.params._sinconfirmar = +this.params._sinconfirmar;
      this.endSubs.add(
        this.pdfServicio.getReporteValorizado(this.params).subscribe(res => {
          this.cargando = false;
          if (res) {
            const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
            if (+esExcel === 0) {              
              openInNewTab(URL.createObjectURL(blob));
            } else {
              saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
            }
          } else {
            this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
          }
        })
      );
    } else {
      this.snackBar.open('Por favor ingrese todos los parámetros.', 'Inventario Valorizado', { duration: 7000 });
    }
  }

  onSedesSelected = (obj: any) => {
    this.getBodega({ sede: this.params.sede });
  }

  resetParams = () => {
    this.params = {
      fecha: moment().format(GLOBAL.dbDateFormat),
      _coniva: '0',
      _sinconfirmar: '0'
    };
    // this.archivo_pdf = null;
    this.cargando = false;
  }

}

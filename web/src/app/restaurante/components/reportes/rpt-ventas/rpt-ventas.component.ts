import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import * as moment from 'moment';

import { PorCategoria, PorArticulo } from '../../../interfaces/reporte-ventas';
import { ReporteVentasService } from '../../../services/reporte-ventas.service';
import { UsuarioSede } from '../../../../admin/interfaces/acceso';
import { AccesoUsuarioService } from '../../../../admin/services/acceso-usuario.service';
import { TipoTurno } from '../../../interfaces/tipo-turno';
import { TipoTurnoService } from '../../../services/tipo-turno.service';
import { saveAs } from 'file-saver';
import { ConfiguracionBotones } from '../../../../shared/interfaces/config-reportes';

@Component({
  selector: 'app-rpt-ventas',
  templateUrl: './rpt-ventas.component.html',
  styleUrls: ['./rpt-ventas.component.css']
})
export class RptVentasComponent implements OnInit {
  
  get configBotones() {
    const deshabilitar = !moment(this.params.fdel).isValid() || !moment(this.params.fal).isValid() || !this.params.tipo_reporte;
    return {
      showPdf: true, showHtml: false, showExcel: true,
      isPdfDisabled: deshabilitar,
      isExcelDisabled: deshabilitar
    }
  };

  // get placeHolderFechaDel() {
  //   return +this.params.tipo_reporte === 3 ? 'Fecha' : 'Del';
  // }

  public tiposReporte: any[] = [];
  public params: any = {};
  public paramsToSend: any = {};
  public msgGenerandoReporte: string = null;
  public porCategoria: PorCategoria[] = [];
  public porArticulo: any = { datos: [] };
  public tiposTurno: TipoTurno[] = [];
  public sedes: UsuarioSede[] = [];
  public grupos = GLOBAL.grupos;
  public tituloCategoria = 'Ventas_Categoria';
  public tituloArticulo = 'Ventas_Articulo';
  public cargando = false;

  constructor(
    private snackBar: MatSnackBar,
    private rptVentasSrvc: ReporteVentasService,
    private tipoTurnoSrvc: TipoTurnoService,
    private sedeSrvc: AccesoUsuarioService
  ) { }

  ngOnInit() {
    this.resetParams();
    this.loadTiposReporte();
    this.loadTiposTurno();
    this.loadSedes();
  }

  loadSedes = () => {
    this.sedeSrvc.getSedes({reporte: true}).subscribe(res => {
      if (res) {
        this.sedes = res
      }
    })
  }

  loadTiposTurno = () => {
    this.tipoTurnoSrvc.get().subscribe(res => {
      if (res) {
        this.tiposTurno = res;
      }
    });
  }

  loadTiposReporte = () => {
    this.tiposReporte = [
      { tipo_reporte: 1, descripcion: 'Por categoría' },
      { tipo_reporte: 2, descripcion: 'Por artículo' },
      { tipo_reporte: 3, descripcion: 'Por categoría agrupado por combo' }
    ];
  }

  resetParams = () => {
    this.porCategoria = [];
    this.porArticulo = [];
    this.msgGenerandoReporte = null;
    this.params = {
      tipo_reporte: undefined,
      fdel: moment().startOf('week').format(GLOBAL.dbDateFormat),
      fal: moment().endOf('week').format(GLOBAL.dbDateFormat)
    };
    this.cargando = false;
  }

  getReporte = (tipo: number = 1) => {
    // if(+this.params.tipo_reporte === 3) {
    //   this.params.fal = this.params.fdel;
    // }
    this.paramsToSend = JSON.parse(JSON.stringify(this.params));
    this.msgGenerandoReporte = 'GENERANDO REPORTE EN ';
    switch (tipo) {
      case 1 : this.getEnPantalla(); break;
      case 2 : this.getPdf(); break;
      case 3 : this.getExcel(); break;
    }
  }

  getPdf = () => {
    switch (this.params.tipo_reporte) {
      case 1: this.getPorCategoriaPdf(); break;
      case 2: this.getPorArticuloPdf(); break;
      case 3: this.getPorCatAgrupadoCombo(); break;
    }
  }

  getExcel = () => {
    switch (this.params.tipo_reporte) {
      case 1: this.getPorCategoriaPdf(1); break;
      case 2: this.getPorArticuloPdf(1); break;
      case 3: this.getPorCatAgrupadoCombo(1); break;
    }
  }

  getPorCategoriaExcel = () => {
    this.paramsToSend._excel = 1;
    this.cargando = true;
    this.cleanParams();
    this.rptVentasSrvc.porCategoriaPdf(this.paramsToSend).subscribe(res => {
      this.cargando = false;
      if (res) {
        const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
        saveAs(blob, `${this.tituloCategoria}.xls`);
      } else {
        this.snackBar.open('No se pudo generar el reporte...', this.tituloCategoria, { duration: 3000 });
      }
    });
  }

  getPorCategoriaPdf = (esExcel = 0) => {
    this.paramsToSend._excel = esExcel;
    this.cargando = true;
    this.cleanParams();
    this.rptVentasSrvc.porCategoriaPdf(this.paramsToSend).subscribe(res => {
      this.cargando = false;
      if (res) {
        const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
        saveAs(blob, `${this.tituloCategoria}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
      } else {
        this.snackBar.open('No se pudo generar el reporte...', 'Ventas por categoría', { duration: 3000 });
      }
    });
  }

  getPorArticuloPdf = (esExcel = 0) => {
    this.paramsToSend._excel = esExcel;
    this.cargando = true;
    this.cleanParams();
    this.rptVentasSrvc.porArticuloPdf(this.paramsToSend).subscribe(res => {
      this.cargando = false;
      if (res) {
        const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
        saveAs(blob, `${this.tituloArticulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
      } else {
        this.snackBar.open('No se pudo generar el reporte...', 'Ventas por artículo', { duration: 3000 });
      }
    });
  }

  getPorCatAgrupadoCombo = (esExcel = 0) => {
    this.paramsToSend._excel = esExcel;
    this.cargando = true;
    this.cleanParams();
    this.rptVentasSrvc.porCategoriaPorCombo(this.paramsToSend).subscribe(res => {
      this.cargando = false;
      if (res) {
        const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
        saveAs(blob, `${this.tituloCategoria}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
      } else {
        this.snackBar.open('No se pudo generar el reporte...', 'Ventas por categoría', { duration: 3000 });
      }
    });
  }

  getEnPantalla = () => {
    switch (this.params.tipo_reporte) {
      case 1: this.getPorCategoriaEnPantalla(); break;
      case 2: this.getPorArticuloEnPantalla(); break;
    }
  }

  cleanParams = () => delete this.paramsToSend.tipo_reporte;

  getPorCategoriaEnPantalla = () => {
    this.cargando = true;
    this.cleanParams();
    this.rptVentasSrvc.porCategoria(this.paramsToSend).subscribe(res => {
      this.cargando = false;
      if (res) {
        this.porCategoria = res;
      } else {
        this.snackBar.open('No se pudo generar el reporte...', 'Ventas por categoría', { duration: 3000 });
      }
    });
  }

  getPorArticuloEnPantalla = () => {
    this.cargando = true;
    this.cleanParams();
    this.rptVentasSrvc.porArticulo(this.paramsToSend).subscribe(res => {
      this.cargando = false;
      if (res) {
        this.porArticulo = res;
      } else {
        this.snackBar.open('No se pudo generar el reporte...', 'Ventas por artículo', { duration: 3000 });
      }
    });
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';
import { Bodega } from '@wms-interfaces/bodega';
import { ArticuloCodigo } from '@wms-interfaces/articulo';
import { BodegaService } from '@wms-services/bodega.service';
import { ArticuloService } from '@wms-services/articulo.service';
import { UsuarioSede } from '@admin-interfaces/acceso';
import { ConfiguracionBotones } from '@shared-interfaces/config-reportes';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kardex',
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.css']
})
export class KardexComponent implements OnInit, OnDestroy {

  public bodegas: Bodega[] = [];
  public sedes: UsuarioSede[] = [];
  public articulos: ArticuloCodigo[] = [];
  public filteredArticulos: ArticuloCodigo[] = [];
  public txtArticuloSelected: (ArticuloCodigo | string) = undefined;
  public params: any = {};
  public titulo: string = "Kardex";
  public cargando = false;
  public configBotones: ConfiguracionBotones = {
    showPdf: true, showHtml: false, showExcel: true
  };
  public archivo_pdf: string = null;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private sedeSrvc: AccesoUsuarioService,
    private bodegaSrvc: BodegaService,
    private articuloSrvc: ArticuloService
  ) { }

  ngOnInit() {
    this.getSede();
    // this.getBodega();
    // this.getArticulo();
    this.txtArticuloSelected = undefined;
    this.params.fdel = moment().startOf('month').format(GLOBAL.dbDateFormat);
    this.params.fal = moment().format(GLOBAL.dbDateFormat);
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  // getDescripcionArticulo = (codigoArticulo: string) => this.articulos.find(art => art.codigo === codigoArticulo).descripcion || '';

  filtrarArticulos = (value: (ArticuloCodigo | string)) => {
    if (value && (typeof value === 'string')) {
      const filterValue = value.toLowerCase();
      this.filteredArticulos = this.articulos.filter(a => a.descripcion.toLowerCase().includes(filterValue));
    } else {
      this.filteredArticulos = this.articulos;
    }
  }

  displayArticulo = (art: ArticuloCodigo) => {
    if (art) {
      this.params.articulo = art.codigo;
      return `${art.descripcion} (${art.codigo})`;
    }
    return undefined;
  }

  getSede = (params: any = {}) => {
    this.endSubs.add(
      this.sedeSrvc.getSedes(params).subscribe(res => {
        this.sedes = res;
      })
    );
  }

  getArticulo = (params: any = {}) => {
    this.endSubs.add(
      this.articuloSrvc.getArticulosSedeCodigo(params).subscribe(res => {
        this.articulos = res;
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
    // console.log(this.params); return;
    if (
      this.params.sede && this.params.bodega && this.params.sede.length > 0 && this.params.bodega.length > 0 &&
      this.params.fdel && moment(this.params.fdel).isValid() && this.params.fal && moment(this.params.fal).isValid() &&
      this.params.articulo && this.params.articulo.length > 0
    ) {
      this.params._excel = esExcel;
      // console.log(this.params); return;
      this.cargando = true;
      this.endSubs.add(
        this.pdfServicio.getReporteKardex(this.params).subscribe(res => {
          if (res) {
            const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
            if (+esExcel === 0) {
              this.archivo_pdf = URL.createObjectURL(blob);
            } else {
              saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
            }
          } else {
            this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
          }
          this.cargando = false;
        })
      );
    } else {
      this.snackBar.open('Por favor ingrese todos los parámetros.', 'Kardex', { duration: 7000 });
    }
  }

  onSedesSelected = (obj: any) => {
    this.getBodega({ sede: this.params.sede });
    this.getArticulo({ sede: this.params.sede });
  }

  resetParams = () => {
    this.params = {
      fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat)
    };
    this.txtArticuloSelected = undefined;
    this.articulos = [];
    this.filteredArticulos = [];
    this.bodegas = [];
    this.archivo_pdf = null;
    this.cargando = false;
  }

}

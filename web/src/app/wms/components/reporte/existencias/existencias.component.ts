import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL, openInNewTab } from '@shared/global';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';
import { Bodega } from '@wms-interfaces/bodega';
import { BodegaService } from '@wms-services/bodega.service';
import { UsuarioSede } from '@admin-interfaces/acceso';
import { ConfiguracionBotones } from '@shared-interfaces/config-reportes';
import { ArticuloService } from '@wms-services/articulo.service';
import { SubCategoriaSimpleSearch } from '@wms-interfaces/categoria-grupo';

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
  public lstSubCategorias: SubCategoriaSimpleSearch[] = [];
  // public archivo_pdf: string = null;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private sedeSrvc: AccesoUsuarioService,
    private bodegaSrvc: BodegaService,
    private articuloSrvc: ArticuloService
  ) { }

  ngOnInit() {
    this.params.fecha_del = moment().startOf('week').format(GLOBAL.dbDateFormat);
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

  loadSubCategorias = (idsede: number) => {
    this.endSubs.add(
      this.articuloSrvc.getCategoriasGruposSimple({ debaja: 0, sede: idsede }).subscribe(res => {
        this.lstSubCategorias = res.map(r => {
          r.categoria_grupo = +r.categoria_grupo;
          return r;
        });
      })
    );
  }

  onSubmit(esExcel = 0) {
    if (
      this.params.sede && this.params.bodega && this.params.sede.length > 0 && this.params.bodega.length > 0 &&
      this.params.fecha && moment(this.params.fecha).isValid() && this.params.fecha_del && moment(this.params.fecha_del).isValid()
    ) {
      this.params.solo_bajo_minimo = this.params.solo_bajo_minimo ? 1 : 0;
      this.params._excel = esExcel;
      this.cargando = true;
      this.endSubs.add(
        this.pdfServicio.getReporteExistencia(this.params).subscribe(res => {
          this.cargando = false;
          if (res) {
            const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
            if (+esExcel === 0) {              
              openInNewTab(URL.createObjectURL(blob));
            } else {
              saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xlsx'}`);
            }
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
    if (this.params.sede.length > 0) {
      this.loadSubCategorias(this.params.sede[0]);
    }
  }

  resetParams = () => {
    this.params = {
      fecha: moment().format(GLOBAL.dbDateFormat),
      solo_bajo_minimo: 0,
      categoria_grupo: null
    };
    // this.archivo_pdf = null;
    this.cargando = false;
  }

}

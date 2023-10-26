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
  selector: 'app-consumos',
  templateUrl: './consumos.component.html',
  styleUrls: ['./consumos.component.css']
})
export class ConsumosComponent implements OnInit, OnDestroy {

  public bodegas: Bodega[] = [];
  public sedes: UsuarioSede[] = [];
  public params: any = {};
  public titulo: string = 'Consumos';
  public cargando = false;
  public lstSubCategorias: SubCategoriaSimpleSearch[] = [];
  public configBotones: ConfiguracionBotones = {
    showPdf: false, showHtml: false, showExcel: true
  };
  // public archivo_pdf: string = null;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private sedeSrvc: AccesoUsuarioService,
    private bodegaSrvc: BodegaService,
    private articuloSrvc: ArticuloService
  ) { }

  ngOnInit(): void {
    this.getSede();
    this.params.fdel = moment().startOf('week').format(GLOBAL.dbDateFormat);
    this.params.fal = moment().format(GLOBAL.dbDateFormat);
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

  onSedesSelected = (obj: any) => {
    this.getBodega({ sede: this.params.lasede });
    this.loadSubCategorias(this.params.lasede);
  }

  resetParams = () => {
    this.params = {
      fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat)
    };
    this.bodegas = [];
    this.lstSubCategorias = [];
    this.params.lasede = null;
    this.params.labodega = null;
    this.cargando = false;
    // this.archivo_pdf = null;
  }

  onSubmit(esExcel = 0) {
    if (
      this.params.lasede && this.params.labodega && this.params.fdel && moment(this.params.fdel).isValid() && this.params.fal && moment(this.params.fal).isValid()
    ) {
      this.params.sede = [this.params.lasede];
      this.params.bodega = [this.params.labodega];
      this.params._excel = esExcel;
      // console.log(this.params); return;
      this.cargando = true;
      this.endSubs.add(
        this.pdfServicio.getReporteConsumos(this.params).subscribe(res => {
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
          this.cargando = false;
        })
      );
    } else {
      this.snackBar.open('Por favor ingrese todos los parámetros.', 'Consumos', { duration: 7000 });
    }
  }

}

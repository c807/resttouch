import { LocalstorageService } from "@admin/services/localstorage.service";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GLOBAL, openInNewTab } from "@shared/global";
import { Bodega } from "@wms/interfaces/bodega";
import { BodegaService } from "@wms/services/bodega.service";
import { Subscription } from "rxjs";
import { saveAs } from 'file-saver';
import * as moment from "moment";
import { ReportePdfService } from "@restaurante/services/reporte-pdf.service";

@Component({
	selector: 'app-resumen-traslados',
	templateUrl: './resumen-traslados.component.html',
	styleUrls: ['./resumen-traslados.component.css']
})

export class ResumenTrasladosComponent implements OnInit, OnDestroy {

  get configBotones() {
    return {
      showPdf: true, showExcel: true,
    }
  };

  @Input() enTransformacion = false;

  public paramsToSend: any = {};
  public params: any = {};
  public cargando = false;
  public bodegas: Bodega[] = [];
  public bodegasDestino: Bodega[] = [];
  public bodegasFull: Bodega[] = [];
  public esRequisicion = false;
  public tituloArticulo = 'Reporte_de_traslados';

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private bodegaSrvc: BodegaService,
    private pdfServicio: ReportePdfService,
  ) { }

  ngOnInit() {
    this.resetParams();
    this.loadBodegas();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  loadBodegas = () => {
    this.endSubs.add(
      this.bodegaSrvc.get({ _todas: 1 }).subscribe(res => {
        const sedeActual = (this.ls.get(GLOBAL.usrTokenVar).sede || 0) as number;
        this.bodegasFull = JSON.parse(JSON.stringify(res));
        if (this.esRequisicion) {
          this.bodegas = JSON.parse(JSON.stringify(res));
          this.bodegasDestino = this.bodegas.filter(b => +b.sede === +sedeActual);
        } else {
          if (this.enTransformacion) {
            this.bodegasDestino = this.bodegasFull.filter(b => +b.sede === +sedeActual);
          } else {
            this.bodegasDestino = JSON.parse(JSON.stringify(res));
          }
          this.bodegas = this.bodegasDestino.filter(b => +b.sede === +sedeActual);
        }
      })
    );
  }

  resetParams = () => {
    this.params = {
      fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat),
    };
    this.cargando = false;
  }

  getResumenTraslados = (esExcel = 0) => {
    this.paramsToSend = { ...this.params, _excel: esExcel };

    this.cargando = true;
    this.endSubs.add(
      this.pdfServicio.generar_resumen_traslados(this.paramsToSend).subscribe(res => {
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
          if (+esExcel === 0) {
            openInNewTab(URL.createObjectURL(blob));
          } else {
            saveAs(blob, `resumen_traslados_${moment().format('YYYYMMDD_HHmmss')}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
          }
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Resumen de Traslados', { duration: 3000 });
        }
      })
    );
  }


}
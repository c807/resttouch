import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL, isNotNullOrUndefined } from '@shared/global';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { DetalleCargaRealizadaComponent } from '@wms-components/ajuste-costo-existencia/detalle-carga-realizada/detalle-carga-realizada.component';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';
import { Bodega } from '@wms-interfaces/bodega';
import { BodegaService } from '@wms-services/bodega.service';
import { UsuarioSede } from '@admin-interfaces/acceso';
import { ConfiguracionBotones } from '@shared-interfaces/config-reportes';
import { AjusteCostoExistenciaService } from '@wms-services/ajuste-costo-existencia.service';
import { CargaRealizada_BodegaArticuloCosto } from '@wms-interfaces/bodega';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ajuste-costo-existencia',
  templateUrl: './ajuste-costo-existencia.component.html',
  styleUrls: ['./ajuste-costo-existencia.component.css']
})
export class AjusteCostoExistenciaComponent implements OnInit, OnDestroy {

  public bodegas: Bodega[] = [];
  public sedes: UsuarioSede[] = [];
  public params: any = { sede: null, bodega: null };
  public cargando = false;
  public configBotones: ConfiguracionBotones = {
    showPdf: false, showHtml: false, showExcel: true
  };

  public cargasRealizadas: CargaRealizada_BodegaArticuloCosto[] = [];

  myForm = new FormGroup({
    name: new FormControl('RT_PLANTILLA_DATOS', [Validators.required, Validators.minLength(3)]),
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required])
  });

  get f() {
    return this.myForm.controls;
  }

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private sedeSrvc: AccesoUsuarioService,
    private bodegaSrvc: BodegaService,
    public dialog: MatDialog,
    private ajusteCostoExistenciaSrvc: AjusteCostoExistenciaService
  ) { }

  ngOnInit(): void {
    this.getSede();
    this.loadCargasRealizadas();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  getSede = (fltr: any = {}) => {
    this.cargando = true;
    this.endSubs.add(
      this.sedeSrvc.getSedes(fltr).subscribe(res => {
        this.sedes = res;
        this.cargando = false;
      })
    );
  }

  getBodega = (fltr: any = {}) => {
    this.cargando = true;
    fltr.debaja = 0;
    this.endSubs.add(
      this.bodegaSrvc.get(fltr).subscribe(res => {
        this.bodegas = res;
        this.cargando = false;
      })
    );
  }

  onSedesSelected = () => {
    this.params.bodega = null;
    this.getBodega({ sede: this.params.sede })
  };

  resetParams = () => {
    this.params = { sede: null, bodega: null };
    this.cargando = false;
  }

  descargar_formato = () => {
    if (isNotNullOrUndefined(this.params.sede) && isNotNullOrUndefined(this.params.bodega)) {
      this.cargando = true;
      this.endSubs.add(
        this.pdfServicio.getFormatoExcelAjusteCostoExistencia(this.params).subscribe(res => {
          this.cargando = false;
          if (res) {
            const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
            saveAs(blob, `Ajuste_costo_existencia_${moment().format(GLOBAL.dateTimeFormatRptName)}.xlsx`);
          } else {
            this.snackBar.open('No se pudo descargar la plantilla...', 'Ajuste de costo unitario y existencia', { duration: 3000 });
          }
        })
      );
    } else {
      this.snackBar.open('Por favor ingrese todos los parámetros.', 'Ajuste de costo unitario y existencia', { duration: 7000 });
    }
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.myForm.patchValue({
        fileSource: file
      });
    }
  }

  submit() {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Ajuste de costo unitario y existencia',
        'Este proceso intentará subir los datos del archivo y puede tardar un poco. ¿Desea continuar?', 'Sí', 'No'
      )
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          this.cargando = true;
          const formData = new FormData();
          formData.append('file', this.myForm.get('fileSource')?.value);
          this.endSubs.add(
            this.ajusteCostoExistenciaSrvc.subir_plantilla_ajuste_costo_existencia(formData).subscribe(res => {
              this.snackBar.open(`${res.exito ? '' : 'ERROR: '}${res.mensaje}`, 'Subir plantilla', { duration: 3000 });
              if(res.errores && res.errores.length > 0) {
                const lstErrores: string[] = res.errores;
                this.snackBar.open(`${lstErrores.join(';')}`, '', { duration: 7000});
              }
              this.myForm.reset();
              this.myForm.patchValue({ name: 'Ajuste_costo_existencia' });
              this.loadCargasRealizadas();
              this.cargando = false;
            })
          );
        }
      })
    );
  }

  loadCargasRealizadas = () => {
    this.cargando = true;
    this.endSubs.add(
      this.ajusteCostoExistenciaSrvc.getCargasRealizadas().subscribe(res => {
        this.cargasRealizadas = res;
        this.cargando = false;
      })
    );
  }

  verDetalle = (cargaRealizada: CargaRealizada_BodegaArticuloCosto) => {
    const detalleRef = this.dialog.open(DetalleCargaRealizadaComponent, {
      maxWidth: '100vw', maxHeight: '99vh', width: '99vw', height: '99vh',
      disableClose: true,
      data: cargaRealizada
    });    
  }
}

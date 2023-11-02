import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';
import { GLOBAL, openInNewTab } from '@shared/global';
import * as moment from 'moment';

import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared-components/confirm-dialog/confirm-dialog.component'
import { FisicoService } from '@wms-services/fisico.service';
import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-inventario-fisico',
  templateUrl: './form-inventario-fisico.component.html',
  styleUrls: ['./form-inventario-fisico.component.css']
})
export class FormInventarioFisicoComponent implements OnInit, OnDestroy {

  @Input() esCuadreDiario = false;
  public showForm = true;
  public params: any = {};
  public cargando = false;
  public articulos: any[] = [];
  public inventario: any = {};
  public queSoy = 'Inventario físico';
  private titulo = 'Inventario_Fisico';  

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private fisicoSrvc: FisicoService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.resetDatos();
    if (this.esCuadreDiario)  {
      this.titulo = "Cuadre_Diario";
      this.queSoy = 'Cuadre diario';
    }
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  resetDatos = () => {
    this.articulos = [];
    this.inventario = {
      inventario_fisico: 0,
      sede: null,
      usuario: null,
      categoria_grupo: null,
      fhcreacion: null,
      fecha: null,
      notas: null,
      confirmado: 0
    }
  }

  buscar = () => {
    let numero = "" + this.params.numero;
    if (numero.length < 19) {
      this.resetDatos();
      this.cargando = true;
      this.endSubs.add(
        this.fisicoSrvc.getDetalle(this.params.numero, { escuadrediario: this.esCuadreDiario ? 1 : 0 }).subscribe(res => {
          if (res && res.exito) {
            this.articulos = res.detalle;
            this.inventario = res.inventario;
          } else {
            this.snackBar.open(`ERROR: ${res.mensaje}`, this.queSoy, { duration: 3000 });
          }
          this.cargando = false;
        })
      );
    } else {
      this.snackBar.open(`ERROR: El texto sobrepasa la longitud permitida`, this.queSoy, { duration: 3000 });
    }

  }

  actualizar = () => {
    this.cargando = true;
    this.endSubs.add(
      this.fisicoSrvc.saveDetalle(this.articulos).subscribe(res => {
        if (res.exito) {
          this.snackBar.open('Datos actualizados exitosamente', 'Inventario', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Inventario', { duration: 3000 });
        }
        this.cargando = false;
      })
    );
  }

  confirmar = () => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(`Confirmar ${this.queSoy}`, 'No podrá modificar los datos ingresados. ¿Desea continuar?', 'Sí', 'No')
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.cargando = true;
          this.fisicoSrvc.confirmar(this.inventario).subscribe(res => {
            if (res.exito) {
              this.inventario = res.inventario;
              this.snackBar.open(`${this.queSoy} confirmado exitosamente`, this.queSoy, { duration: 3000 });
            } else {
              this.snackBar.open(`ERROR: ${res.mensaje}`, this.queSoy, { duration: 3000 });
            }
            this.cargando = false;
          })
        }
      })
    );
  }

  imprimir = () => {
    this.cargando = true;
    this.endSubs.add(
      this.pdfServicio.imprimirInventarioFisico(this.inventario.inventario_fisico, { existencia_fisica: true }).subscribe(resImp => {
        const blob = new Blob([resImp], { type: 'application/pdf' });
        openInNewTab(URL.createObjectURL(blob));        
        this.cargando = false;
      })
    );
  }

  imprimirXls = () => {
    this.cargando = true;
    let params = { existencia_fisica: true, "_excel": true };
    this.endSubs.add(
      this.pdfServicio.imprimirInventarioFisico(this.inventario.inventario_fisico, params).subscribe(resImp => {
        const blob = new Blob([resImp], { type: 'application/vnd.ms-excel' });
        saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.xls`);
        this.cargando = false;
      })
    );
  }

}

import { Component, OnInit, Input, Output, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { GLOBAL } from '../../../../shared/global';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import { ccGeneral, ccTipo, ccNominacion, ccDocumentoRetiro } from '../../../interfaces/cajacorte';
import { CajacorteService } from '../../../services/cajacorte.service';
import { FormaPago } from '../../../../admin/interfaces/forma-pago';
import { FpagoService } from '../../../../admin/services/fpago.service';
import * as moment from 'moment';

interface IDataCC {
  turno: number;
  tipo: ccTipo;
}

@Component({
  selector: 'app-cajacorte-form',
  templateUrl: './cajacorte-form.component.html',
  styleUrls: ['./cajacorte-form.component.css']
})
export class CajacorteFormComponent implements OnInit, OnDestroy {

  get totalEfectivo() {
    let tot = 0.00
    this.ccorteNomi.forEach(ccn => tot += +ccn.total);
    return tot;
  }

  get totalFormasPago() {
    let tot = 0.00;
    this.formasPago.forEach(fp => tot += +fp.montocc);
    return tot;
  }

  get granTotal() {
    return this.totalEfectivo + this.totalFormasPago;
  }

  get verDocumento() {
    return +this.data.tipo.pedirdocumento === 1 && this.ccorteNomi.length > 0
  }

  get noGuardar() {
    let docCompleto = true;
    if (+this.data.tipo.pedirdocumento === 1) {
      if (!this.documento.numero || !moment(this.documento.fecha).isValid() || !this.documento.descripcion_documento) {
        docCompleto = false;
      }
    }
    return this.granTotal == 0 || !docCompleto;
  }

  @Input() ccorte: ccGeneral;
  @Output() cajacorteSavedEv = new EventEmitter();
  public ccorteTipo: ccTipo[] = [];
  public ccorteNomi: ccNominacion[] = [];
  public formasPago: FormaPago[] = [];
  public documento: ccDocumentoRetiro = {
    serie: null, numero: null, fecha: moment().format(GLOBAL.dbDateFormat), descripcion_documento: null
  };

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private cajacorteSrvc: CajacorteService,
    private fpagoSrvc: FpagoService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CajacorteFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDataCC
  ) { }

  ngOnInit() {
    this.loadNominaciones();
    this.loadFormasPago();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadNominaciones = () => {
    this.endSubs.add(
      this.cajacorteSrvc.getCajaCorteNominacion().subscribe(res => {
        this.ccorteNomi = res.map(r => {
          r.cantidad = null;
          r.total = 0;
          return r;
        });
        // setTimeout(() => document.getElementById(`txtCantidad_${this.ccorteNomi[0].caja_corte_nominacion}`).focus());
        setTimeout(() => document.getElementById('txtCantidad_0').focus());
      })
    );
  }

  loadFormasPago = () => {
    this.endSubs.add(
      this.fpagoSrvc.get({ activo: 1, esefectivo: 0 }).subscribe(res => {
        this.formasPago = res.map(r => {
          r.montocc = null;
          return r;
        });
      })
    );
  }

  guardar = () => {
    const confRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        `CAJA ${this.data.tipo.descripcion.toUpperCase()}`,
        'Una vez guardado los datos, no podrá modificar. ¿Desea continuar?',
        'Sí', 'No'
      )
    });

    this.endSubs.add(
      confRef.afterClosed().subscribe(cnf => {
        if (cnf) {
          const params = {            
            turno: this.data.turno,
            tipo: this.data.tipo,
            efectivo: this.ccorteNomi,
            formas_pago: this.formasPago,
            documento: this.documento,
            total: this.granTotal
          };
          // console.log(params);
          this.endSubs.add(
            this.cajacorteSrvc.guardar(params).subscribe(res => {
              if (res.exito) {
                this.snackBar.open(res.mensaje, 'Caja', { duration: 3000 });
              } else {
                this.snackBar.open(`ERROR: ${res.mensaje}`, 'Caja', { duration: 3000 });
              }
              this.dialogRef.close();
            })
          );
        }
      })
    );
  }

  cancelar = () => this.dialogRef.close();

  validateNominacion = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[0-9]/.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

  moveNextElement = (obj: KeyboardEvent) => {    
    const srcElem = obj.target as HTMLInputElement;
    const idx = +srcElem.id.split('_')[1];
    let nextElement = document.getElementById(`txtCantidad_${idx + 1}`);    
    if (nextElement) {
      nextElement.focus();
    } else {
      nextElement = document.getElementById('txtFP_0');
      if (nextElement) {
        nextElement.focus();
      }
    }
  }

  moveNextElementFP = (obj: KeyboardEvent) => {    
    const srcElem = obj.target as HTMLInputElement;
    const idx = +srcElem.id.split('_')[1];
    let nextElement = document.getElementById(`txtFP_${idx + 1}`);    
    if (nextElement) {
      nextElement.focus();
    } else {
      nextElement = document.getElementById('txtCantidad_0');
      if (nextElement) {
        nextElement.focus();
      }      
    }
  }

}


import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { IDataAbono } from '@hotel/interfaces/abono';
import { Abono, AbonoFormaPago } from '@hotel/interfaces/abono';
import { AbonoService } from '@hotel/services/abono.service';
import { FormaPago } from '@admin/interfaces/forma-pago';
import { FpagoService } from '@admin/services/fpago.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-abono',
  templateUrl: './form-abono.component.html',
  styleUrls: ['./form-abono.component.css']
})
export class FormAbonoComponent implements OnInit, OnDestroy {

  get totalDeAbono(): number {
    let total = 0;
    for(const fpa of this.formasPagoAbono) {
      total += +fpa.monto;
    }
    return total;
  }  

  @Input() data: IDataAbono = null;
  @Output() abonoSavedEv = new EventEmitter();
  public infoAbono: IDataAbono = null;
  public abono: Abono;
  public formasPagoAbono: AbonoFormaPago[] = [];
  public formaPagoAbono: AbonoFormaPago;
  public formasPago: FormaPago[] = [];
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private ls: LocalstorageService,
    private abonoSrvc: AbonoService,
    private fpagoSrvc: FpagoService,
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.infoAbono = JSON.parse(JSON.stringify(this.data));
    }
    this.resetAbono();
    this.resetAbonoFormaPago();
    this.loadFormasPago();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetAbono = () => {
    const idReserva = this.infoAbono?.reserva && +this.infoAbono?.reserva > 0 ? +this.infoAbono.reserva : null;
    const idFactura = this.infoAbono?.factura && +this.infoAbono?.factura > 0 ? +this.infoAbono.factura : null;
    this.abono = {
      abono: null,
      reserva: idReserva,
      factura: idFactura,
      fecha: moment().format(GLOBAL.dbDateFormat),
      usuario: +this.ls.get(GLOBAL.usrTokenVar).idusr,
      anulado: 0,
      fecha_anulacion: null,
      anuladopor: null
    }
  }

  loadFormasPago = () => {
    this.endSubs.add(
      this.fpagoSrvc.get({ activo: 1, descuento: 0 }).subscribe(res => this.formasPago = res)
    );
  }

  resetAbonoFormaPago = () => {
    this.formaPagoAbono = {
      abono_forma_pago: null,
      abono: +this.abono?.abono || null, 
      forma_pago: null, 
      monto: null
    }
  }

  agregarMonto = () => {    
    this.formasPagoAbono.push(this.formaPagoAbono);    
    this.resetAbonoFormaPago();
  }

  quitarMonto = (idx: number) => {
    this.formasPagoAbono.splice(idx, 1);
  }

  onSubmit = () => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Abono',
        `Esto generará un abono por ${this.totalDeAbono.toFixed(2)} que se descontarán de la cuenta final. ¿Desea continuar?`,
        'Sí', 'No'
      )
    });

    this.endSubs.add(      
      dialogRef.afterClosed().subscribe(conf => {
        if (conf) {
          this.cargando = true;
          this.endSubs.add(
            this.abonoSrvc.save(this.abono).subscribe(res => {
              if (res.exito && +(res.abono as Abono).abono > 0) {
                const idAbono = +(res.abono as Abono).abono;
                let errores = [];
                this.formasPagoAbono.forEach(async (fp) => {
                  fp.abono = idAbono;
                  const resDet = await this.abonoSrvc.saveDetalle(fp).toPromise();
                  if (!resDet.exito) {
                    errores.push(resDet.mensaje);
                  }
                });
                if (errores.length === 0) {
                  this.snackBar.open(`Abono guardado con éxito.`, 'Abono', { duration: 7000 });
                  if (this.infoAbono) {
                    this.abonoSavedEv.emit();
                  }
                } else {
                  this.snackBar.open(`ERROR: ${errores.join(';')}`, 'Abono', { duration: 7000 });
                }
                this.cargando = false;
              } else {
                this.snackBar.open(`ERROR: ${res.mensaje}`, 'Abono', { duration: 7000 });
                this.cargando = false;
              }
            })
          );
        }
      })
    );
  }



}

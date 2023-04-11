import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL } from '@shared/global';
import { Socket } from 'ngx-socket-io';
import * as moment from 'moment';

import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { DialogFacturarAbonoComponent } from '@hotel-components/abono/dialog-facturar-abono/dialog-facturar-abono.component'
import { IDataAbono } from '@hotel/interfaces/abono';
import { Abono, AbonoFormaPago } from '@hotel/interfaces/abono';
import { AbonoService } from '@hotel/services/abono.service';
import { FormaPago } from '@admin/interfaces/forma-pago';
import { FpagoService } from '@admin/services/fpago.service';
import { Impresion } from '@restaurante-classes/impresion';
import { Impresora } from '@admin-interfaces/impresora';
import { ImpresoraService } from '@admin-services/impresora.service';
import { ConfiguracionService } from '@admin-services/configuracion.service';
import { Usuario } from '@admin/models/usuario';
import { Reserva } from '@hotel/interfaces/reserva';
import { ReservaService } from '@hotel-services/reserva.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-abono',
  templateUrl: './form-abono.component.html',
  styleUrls: ['./form-abono.component.css']
})
export class FormAbonoComponent implements OnInit, OnDestroy {

  get totalDeAbono(): number {
    let total = 0;
    for (const fpa of this.formasPagoAbono) {
      total += +fpa.monto;
    }
    return total;
  }

  @Input() data: IDataAbono = null;
  @Output() abonoSavedEv = new EventEmitter();
  @Output() loadAbonosEv = new EventEmitter();
  public infoAbono: IDataAbono = null;
  public abono: Abono;
  public formasPagoAbono: AbonoFormaPago[] = [];
  public formaPagoAbono: AbonoFormaPago;
  public formasPago: FormaPago[] = [];
  public impresoraPorDefecto: Impresora = null;
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private ls: LocalstorageService,
    private abonoSrvc: AbonoService,
    private fpagoSrvc: FpagoService,
    private socket: Socket,
    private configSrvc: ConfiguracionService,
    private impresoraSrvc: ImpresoraService,
    private reservaSrvc: ReservaService
  ) { }

  ngOnInit(): void {
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);
      this.socket.on('reconnect', () => this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid));
    }

    if (this.data) {
      this.infoAbono = JSON.parse(JSON.stringify(this.data));
    }
    this.resetAbono();
    this.resetAbonoFormaPago();
    this.loadFormasPago();
    this.loadImpresoraDefecto();
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
      anuladopor: null,
      monto: null
    }
    this.resetAbonoFormaPago();
    this.formasPagoAbono = [];
  }

  loadFormasPago = () => {
    this.endSubs.add(
      this.fpagoSrvc.get({ activo: 1, descuento: 0 }).subscribe(res => this.formasPago = res)
    );
  }

  loadImpresoraDefecto = () => {
    this.cargando = true;
    const idImpresoraDefecto: number = +this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_IMPRESORA_DEFECTO) || 0;

    this.endSubs.add(
      this.impresoraSrvc.get({ pordefectofactura: 1 }).subscribe((res: Impresora[]) => {
        if (res && res.length > 0) {
          this.impresoraPorDefecto = res[0];
          this.cargando = false;
        } else {
          if (idImpresoraDefecto > 0) {
            this.cargando = true;
            this.endSubs.add(
              this.impresoraSrvc.get({ impresora: idImpresoraDefecto }).subscribe((res: Impresora[]) => {
                if (res && res.length > 0) {
                  this.impresoraPorDefecto = res[0];
                } else {
                  this.impresoraPorDefecto = null;
                }
                this.cargando = false;
              })
            );
          }
          this.cargando = false;
        }
      })
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
        `Esto guardará un abono por ${this.totalDeAbono.toFixed(2)} que se descontarán de la cuenta final. ¿Desea continuar?`,
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
                this.endSubs.add(
                  this.abonoSrvc.limpiaDetalle(idAbono).subscribe(() => {
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
                  })
                );
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

  loadDetalleAbono = () => {
    this.endSubs.add(
      this.abonoSrvc.getDetalle({ abono: +this.abono.abono }).subscribe(res => this.formasPagoAbono = res)
    );
  }

  showFacturaAbono = () => {
    const factAbonoDialogRef = this.dialog.open(DialogFacturarAbonoComponent, {
      width: '70vw', height: '90vh', disableClose: true,
      data: {
        abono: this.abono
      }
    });
    this.endSubs.add(factAbonoDialogRef.afterClosed().subscribe(() => this.loadAbonosEv.emit()));
  }

  facturarAbono = () => {
    if (!this.abono.info_factura.factura) {
      const confDialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: new ConfirmDialogModel(
          'Abono',
          `Con este proceso creará una factura manual por el abono y no podrá modificarlo después de firmar la factura. ¿Desea continuar?`,
          'Sí', 'No'
        )
      });

      this.endSubs.add(
        confDialogRef.afterClosed().subscribe((resCnf) => {
          if (resCnf) {
            this.showFacturaAbono();
          }
        })
      );
    } else {
      this.showFacturaAbono();
    }
  }

  imprimirAbono = async () => {

    const data_abono: any = {
      noabono: this.abono.abono,
      fecha: moment(this.abono.fecha).format(GLOBAL.dateFormat),
      creadopor: `${(this.abono.usuario as Usuario).nombres} ${(this.abono.usuario as Usuario).apellidos}`.trim(),
      monto: +this.abono.monto,
      factura_abono: this.abono.info_factura.factura ? `${this.abono.info_factura.serie_factura}-${this.abono.info_factura.numero_factura}` : null,
      reserva: null,
      factura: null
    }

    if (this.abono.reserva) {
      const resRsv = await this.reservaSrvc.getInfoReserva((this.abono.reserva as Reserva).reserva).toPromise();
      if (resRsv && resRsv.exito) {
        const rsv = resRsv.reserva;
        data_abono.reserva = {
          noreserva: rsv.reserva,
          ubicacion: `${rsv.area} - ${rsv.reservable} (${rsv.tipo_habitacion})`,
          cliente: rsv.cliente,
          del: moment(rsv.fecha_del).format(GLOBAL.dateFormat),
          al: moment(rsv.fecha_al).format(GLOBAL.dateFormat)          
        }        
      }
    }
        
    const objImpresion = new Impresion(this.socket);
    objImpresion.impresoraPorDefecto = this.impresoraPorDefecto;
    objImpresion.imprimirAbono(data_abono);
  }
}

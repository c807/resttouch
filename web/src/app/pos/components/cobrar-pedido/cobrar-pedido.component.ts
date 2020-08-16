import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../shared/global';
import { LocalstorageService } from '../../../admin/services/localstorage.service';
import * as moment from 'moment';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Socket } from 'ngx-socket-io';

import { FormaPago } from '../../interfaces/forma-pago';
import { Cobro } from '../../interfaces/cobro';
import { FormaPagoService } from '../../services/forma-pago.service';
import { CobroService } from '../../services/cobro.service';
import { Cliente } from '../../../admin/interfaces/cliente';
import { FacturaRequest } from '../../interfaces/factura';
import { FacturaService } from '../../services/factura.service';

@Component({
  selector: 'app-cobrar-pedido',
  templateUrl: './cobrar-pedido.component.html',
  styleUrls: ['./cobrar-pedido.component.css']
})
export class CobrarPedidoComponent implements OnInit {

  @Input() inputData: any = {};
  public lstFormasPago: FormaPago[] = [];
  public formaPago: any = {};
  public formasPagoDeCuenta: any[] = [];
  public factReq: FacturaRequest;
  public clienteSelected: Cliente;
  public esMovil = false;
  public facturando = false;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CobrarPedidoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    public formaPagoSrvc: FormaPagoService,
    public cobroSrvc: CobroService,
    public facturaSrvc: FacturaService,
    private ls: LocalstorageService,
    private socket: Socket,
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.processData();
    this.loadFormasPago();
    this.resetFactReq();
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);
    }
  }

  resetFactReq = () => {
    this.factReq = { cuentas: [], factura_serie: 1, cliente: null, fecha_factura: moment().format(GLOBAL.dbDateFormat), moneda: 1 };
  }

  processData = () => {
    if (this.data) {
      this.inputData = this.data;
    } else {
      this.data = this.inputData;
    }

    this.inputData.totalDeCuenta = 0.00;
    this.inputData.productosACobrar.forEach((item: any) => {
      this.inputData.totalDeCuenta += (item.precio * item.cantidad);
    });

    this.calculaPropina();
    this.actualizaSaldo();
    this.formaPago.monto = parseFloat(this.inputData.saldo).toFixed(2);
  }

  calculaPropina = () => {
    this.inputData.montoPropina = parseFloat((this.inputData.porcentajePropina * this.inputData.totalDeCuenta / 100).toFixed(2));
    this.actualizaSaldo();
  }

  calculaPorcentajePropina() {
    this.inputData.porcentajePropina = parseFloat((this.inputData.montoPropina * 100 / this.inputData.totalDeCuenta).toFixed(2));
    this.actualizaSaldo();
  }

  loadFormasPago = () => {
    this.formaPagoSrvc.get({ activo: 1 }).subscribe((res: any) => {
      if (!!res && res.length > 0) {
        this.lstFormasPago = res;
      }
    });
  }

  addFormaPago = () => {
    this.formasPagoDeCuenta.push({
      forma_pago: this.lstFormasPago.filter(f => +f.forma_pago === +this.formaPago.forma_pago)[0],
      monto: parseFloat(this.formaPago.monto).toFixed(2),
      propina: (this.formaPago.propina || 0.00)
    });
    this.actualizaSaldo();
  }

  delFormaPago = (idx: number) => {
    this.formasPagoDeCuenta.splice(idx, 1);
    this.actualizaSaldo();
  }

  actualizaSaldo = () => {
    let sumFormasPago = 0.00;
    this.formasPagoDeCuenta.forEach(fp => sumFormasPago += +fp.monto);
    // this.inputData.saldo = this.inputData.totalDeCuenta + this.inputData.montoPropina - sumFormasPago;
    this.inputData.saldo = (+this.inputData.totalDeCuenta - sumFormasPago).toFixed(2);
    this.formaPago = { monto: this.inputData.saldo };
  }

  cancelar = () => this.dialogRef.close();

  setClienteFacturar = (obj: Cliente) => {
    this.clienteSelected = obj;
    this.factReq.cliente = +obj.cliente;
  }

  cobrar = () => {
    this.facturando = true;
    const objCobro: Cobro = {
      cuenta: this.inputData.idcuenta,
      forma_pago: [],
      total: this.inputData.totalDeCuenta + this.inputData.montoPropina,
      propina_monto: this.inputData.montoPropina,
      propina_porcentaje: this.inputData.porcentajePropina
    };

    for (const fp of this.formasPagoDeCuenta) {
      objCobro.forma_pago.push({
        forma_pago: +fp.forma_pago.forma_pago,
        monto: fp.monto,
        propina: (fp.propina || 0.00)
      });
    }

    this.factReq.cuentas.push({ cuenta: +this.inputData.idcuenta });
    this.cobroSrvc.save(objCobro).subscribe(res => {
      if (res.exito && !res.facturada) {
        this.snackBar.open('Cobro', `${res.mensaje}`, { duration: 3000 });
        this.facturaSrvc.facturar(this.factReq).subscribe(resFact => {
          // console.log('RESPUESTA DE FACTURAR = ', resFact);
          if (resFact.exito) {
            const confirmRef = this.dialog.open(ConfirmDialogComponent, {
              maxWidth: '400px',
              data: new ConfirmDialogModel('Imprimir factura', '¿Desea imprimir la factura?', 'Sí', 'No')
            });

            confirmRef.afterClosed().subscribe((confirma: boolean) => {
              if (confirma) {
                this.printFactura(resFact.factura);
              }
              this.resetFactReq();
              this.snackBar.open('Factura', `${resFact.mensaje}`, { duration: 3000 });
              this.facturando = false;
              this.dialogRef.close(res.cuenta);
            });
          } else {
            this.facturando = false;
            this.snackBar.open('Factura', `ERROR: ${res.mensaje}`, { duration: 7000 });
            this.dialogRef.close(res.cuenta);
          }
        });
      } else {
        this.facturando = false;
        this.snackBar.open('Cobro', `ERROR: ${res.mensaje}`, { duration: 7000 });
        this.dialogRef.close('closePanel');
      }
    });
  }

  procesaDetalleFactura = (detalle: any[]) => {
    const detFact: any[] = [];
    detalle.forEach(d => detFact.push({
      Cantidad: +d.cantidad,
      Descripcion: d.articulo.descripcion,
      Total: +d.total
    }));
    return detFact;
  }

  getTotalDetalle = (detalle: any[]): number => {
    let suma = 0.00;
    detalle.forEach(d => suma += +d.total);
    return suma;
  }

  printFactura = (factura: any) => {
    // console.log('FACTURA = ', factura);
    this.facturaSrvc.imprimir(+factura.factura).subscribe(res => {
      if (res.factura) {
        this.socket.emit(`print:factura`, `${JSON.stringify({
          NombreEmpresa: res.factura.empresa.nombre,
          NitEmpresa: res.factura.empresa.nit,
          SedeEmpresa: res.factura.sedeFactura.nombre,
          DireccionEmpresa: res.factura.empresa.direccion,
          Fecha: moment(res.factura.fecha_factura).format(GLOBAL.dateFormat),
          Nit: res.factura.receptor.nit,
          Nombre: res.factura.receptor.nombre,
          Direccion: res.factura.receptor.direccion,
          Serie: res.factura.serie_factura,
          Numero: res.factura.numero_factura,
          Total: this.getTotalDetalle(res.factura.detalle),
          NoAutorizacion: res.factura.fel_uuid,
          NombreCertificador: res.factura.certificador_fel.nombre,
          NitCertificador: res.factura.certificador_fel.nit,
          FechaDeAutorizacion: res.factura.fecha_autorizacion,
          NoOrdenEnLinea: '',
          FormaDePago: '',
          DetalleFactura: this.procesaDetalleFactura(res.factura.detalle)
        })}`);
        this.snackBar.open(
          `Imprimiendo factura ${res.factura.serie_factura}-${res.factura.numero_factura}`,
          'Impresión', { duration: 3000 }
        );
      } else {
        this.snackBar.open(`ERROR: ${res.mensaje}`, 'Impresión', { duration: 7000 });
      }
    });
  }
}

import { Component, Inject, Input, NgModule, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectChange } from '@angular/material/select';
import { GLOBAL } from '../../../shared/global';
import { LocalstorageService } from '../../../admin/services/localstorage.service';
import * as moment from 'moment';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  CheckPasswordComponent,
  ConfigCheckPasswordModel
} from '../../../shared/components/check-password/check-password.component';
import { Socket } from 'ngx-socket-io';

import { FormaPago } from '../../interfaces/forma-pago';
import { Cobro } from '../../interfaces/cobro';
import { FormaPagoService } from '../../services/forma-pago.service';
import { CobroService } from '../../services/cobro.service';
import { Cliente } from '../../../admin/interfaces/cliente';
import { FacturaRequest } from '../../interfaces/factura';
import { FacturaService } from '../../services/factura.service';
import { Sede } from '../../../admin/interfaces/sede';
import { SedeService } from '../../../admin/services/sede.service';
import { ComandaService } from '../../../restaurante/services/comanda.service';
import { ConfiguracionService } from '../../../admin/services/configuracion.service';
import { Base64 } from 'js-base64';
import { Subscription } from 'rxjs';
import { ClienteMasterService } from '../../../callcenter/services/cliente-master.service';
import { ClienteMasterDireccionResponse } from '../../../callcenter/interfaces/cliente-master';
import { TiempoEntrega } from '../../../callcenter/interfaces/tiempo-entrega';
import { TiempoEntregaService } from '../../../callcenter/services/tiempo-entrega.service';

interface DatosPedido {
  sede: number;
  direccion_entrega: string;
  telefono: string;
  nombre: string;
  cliente?: any;
  tiempo_entrega?: number;
}

@Component({
  selector: 'app-cobrar-pedido',
  templateUrl: './cobrar-pedido.component.html',
  styleUrls: ['./cobrar-pedido.component.css']
})
export class CobrarPedidoComponent implements OnInit, OnDestroy {

  @Input() inputData: any = {};
  public lstFormasPago: FormaPago[] = [];
  public formaPago: any = {};
  public formasPagoDeCuenta: any[] = [];
  public factReq: FacturaRequest;
  public clienteSelected: Cliente;
  public esMovil = false;  /* Browser de Movil o Escritorio */
  public keyboardLayout: string;
  public facturando = false;
  public cargandoConf: any = { w: 75, h: 75 };
  public pideDocumento = false;
  public sedes: Sede[] = [];
  public sede: Sede;
  public datosPedido: DatosPedido = { sede: null, direccion_entrega: null, telefono: null, nombre: null, cliente: null, tiempo_entrega: null };
  public descripcionUnica = { enviar_descripcion_unica: 0, descripcion_unica: null };
  public isTipExceeded = false;
  public porcentajeMaximoPropina = 0;
  public MaxTooltTipMessage = '';
  public direccionesDeEntrega: ClienteMasterDireccionResponse[] = [];
  public tiemposEntrega: TiempoEntrega[] = [];

  private endSubs = new Subscription();

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
    private sedeSrvc: SedeService,
    private comandaSrvc: ComandaService,
    private configSrvc: ConfiguracionService,
    private clienteMasterSrvc: ClienteMasterService,
    private tiempoEntregaSrvc: TiempoEntregaService
  ) {
  }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.porcentajeMaximoPropina = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_PORCENTAJE_MAXIMO_PROPINA) || 10;
    this.MaxTooltTipMessage = `El monto de propina sobrepasa el máximo sugerido del ${this.porcentajeMaximoPropina}%.`;
    this.keyboardLayout = GLOBAL.IDIOMA_TECLADO;
    this.resetFactReq();
    this.processData();
    this.loadFormasPago();
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);
      this.socket.on('reconnect', () => this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid));
    }
    this.loadSedes();
    this.loadTiemposEntrega();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  resetFactReq = () => {
    this.factReq = {
      cuentas: [],
      factura_serie: 1,
      cliente: null,
      fecha_factura: moment().format(GLOBAL.dbDateFormat),
      moneda: 1,
      enviar_descripcion_unica: 0,
      descripcion_unica: null
    };
  }

  processData = () => {
    if (this.data) {
      this.inputData = this.data;
    } else {
      this.data = this.inputData;
    }

    // console.log('MESA = ', this.data.mesaenuso);
    // console.log(this.inputData.productosACobrar);

    this.inputData.totalDeCuenta = 0.00;
    this.inputData.productosACobrar.forEach((item: any) => {
      this.inputData.totalDeCuenta += (item.precio * item.cantidad) + (item.monto_extra);
    });

    this.calculaPropina();
    this.actualizaSaldo();
    this.formaPago.monto = parseFloat(this.inputData.saldo).toFixed(2);
    // console.log('INPUT DATA = ', this.inputData);
    if (this.inputData.clientePedido) {
      this.setClienteFacturar(this.inputData.clientePedido);
    }
  }

  loadSedes = () => {
    this.endSubs.add(
      this.sedeSrvc.get().subscribe(res => this.sedes = res)
    );
  }

  loadTiemposEntrega = () => {
    this.endSubs.add(
      this.tiempoEntregaSrvc.get().subscribe(res => this.tiemposEntrega = res)
    );
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
    this.endSubs.add(
      this.formaPagoSrvc.get({ activo: 1 }).subscribe((res: any) => {
        if (!!res && res.length > 0) {
          this.lstFormasPago = res;
        }
      })
    );
  }

  addFormaPago = () => {
    const fp = this.lstFormasPago.filter(f => +f.forma_pago === +this.formaPago.forma_pago)[0];
    if (+fp.pedirautorizacion === 1) {
      const vpgtRef = this.dialog.open(CheckPasswordComponent, {
        width: '40%',
        disableClose: true,
        data: new ConfigCheckPasswordModel(1)
      });

      this.endSubs.add(
        vpgtRef.afterClosed().subscribe(res => {
          if (res) {
            this.agregaFormaPago(fp);
          } else {
            this.snackBar.open('La contraseña no es correcta', 'Formas de pago', { duration: 5000 });
          }
        })
      );
    } else {
      this.agregaFormaPago(fp);
    }
  }


  /**
   * It calculates if it should show the alert or not of tip Exceeded
   * It itetares over formasDePago
   */
  calcTipExceeded = () => {
    const tipPorcentaje = this.porcentajeMaximoPropina / 100;
    const tipLimit = this.inputData.totalDeCuenta * tipPorcentaje;
    let amount = (Number(this.formaPago.propina) || 0.00);

    this.formasPagoDeCuenta.forEach((forP) => {
      amount += Number(forP.propina);
    });

    this.isTipExceeded = (tipLimit < amount);
  }

  /**
   * This method detects when the value changes on Propina Input
   */
  onPropinaInputChage = () => {
    this.calcTipExceeded();
  }

  agregaFormaPago = (fp: FormaPago) => {
    this.formasPagoDeCuenta.push({
      forma_pago: fp,
      monto: parseFloat(this.formaPago.monto).toFixed(2),
      propina: (this.formaPago.propina || 0.00),
      documento: (this.formaPago.documento || null),
      comision_monto: +this.formaPago.monto * +fp.comision_porcentaje / 100
    });
    this.actualizaSaldo();
    this.pideDocumento = false;
    this.calcTipExceeded();
  }

  delFormaPago = (idx: number) => {
    this.formasPagoDeCuenta.splice(idx, 1);
    this.actualizaSaldo();
    this.calcTipExceeded();
  }

  actualizaSaldo = () => {
    let sumFormasPago = 0.00;
    this.formasPagoDeCuenta.forEach(fp => sumFormasPago += +fp.monto);
    // this.inputData.saldo = this.inputData.totalDeCuenta + this.inputData.montoPropina - sumFormasPago;
    this.inputData.saldo = (+this.inputData.totalDeCuenta - sumFormasPago).toFixed(2);
    this.formaPago = { monto: this.inputData.saldo };
  }

  cancelar = () => this.dialogRef.close();

  setClienteFacturar = async (obj: Cliente) => {
    if (obj && +obj.cliente > 0) {
      this.clienteSelected = obj;
      this.factReq.cliente = +obj.cliente;
    }

    if (+this.data.mesaenuso.mesa.escallcenter === 1) {
      const varCliPedido = `${GLOBAL.rtClientePedido}_${this.data.mesaenuso.mesa.mesa}`;
      const cliPedido = this.ls.get(varCliPedido) || null;
      if (cliPedido && cliPedido.cliente_master && +cliPedido.cliente_master > 0) {
        this.datosPedido.nombre = cliPedido.nombre;
        this.datosPedido.direccion_entrega = this.datosPedido?.direccion_entrega || null;
        this.datosPedido.telefono = cliPedido.numero;
        this.direccionesDeEntrega = await this.clienteMasterSrvc.buscarDireccion({ cliente_master: +cliPedido.cliente_master }).toPromise();
      } else {
        this.datosPedido.nombre = obj.nombre;
        this.datosPedido.direccion_entrega = obj.direccion;
        this.datosPedido.telefono = obj.telefono;
      }
    }
  }

  cobrar = () => {
    this.facturando = true;
    const objCobro: Cobro = {
      cuenta: this.inputData.idcuenta,
      forma_pago: [],
      total: this.inputData.totalDeCuenta + this.inputData.montoPropina,
      propina_monto: this.inputData.montoPropina,
      propina_porcentaje: this.inputData.porcentajePropina,
      comision_monto: 0.00
    };

    let sumaMontoComision = 0.00;

    for (const fp of this.formasPagoDeCuenta) {
      sumaMontoComision += (fp.comision_monto || 0);
      objCobro.forma_pago.push({
        forma_pago: +fp.forma_pago.forma_pago,
        monto: +fp.monto + +fp.comision_monto,
        propina: (fp.propina || 0.00),
        documento: fp.documento,
        comision_monto: fp.comision_monto
      });
    }
    objCobro.comision_monto = sumaMontoComision;
    objCobro.total += sumaMontoComision;

    if (+this.data.mesaenuso.mesa.escallcenter === 1) {
      this.enviarPedido(objCobro);
      return;
    }

    this.factReq.cuentas.push({ cuenta: +this.inputData.idcuenta });
    this.endSubs.add(
      this.cobroSrvc.save(objCobro).subscribe(res => {
        if (res.exito && !res.facturada) {
          this.snackBar.open('Cobro', `${res.mensaje}`, { duration: 3000 });
          if (res.facturar) {
            this.factReq.enviar_descripcion_unica = this.descripcionUnica.enviar_descripcion_unica;
            this.factReq.descripcion_unica = this.descripcionUnica.descripcion_unica;
            this.endSubs.add(
              this.facturaSrvc.facturar(this.factReq).subscribe(resFact => {
                // console.log('RESPUESTA DE FACTURAR = ', resFact);
                if (resFact.exito) {
                  const confirmRef = this.dialog.open(ConfirmDialogComponent, {
                    maxWidth: '400px',
                    data: new ConfirmDialogModel('Imprimir factura', '¿Desea imprimir la factura?', 'Sí', 'No')
                  });

                  this.endSubs.add(
                    confirmRef.afterClosed().subscribe((confirma: boolean) => {
                      if (confirma) {
                        this.printFactura(resFact.factura, res.cuenta);
                      } else {
                        this.dialogRef.close(res.cuenta);
                      }
                      this.resetFactReq();
                      this.snackBar.open('Factura', `${resFact.mensaje}`, { duration: 3000 });
                      this.facturando = false;
                      this.socket.emit('refrescar:mesa', { mesaenuso: this.data.mesaenuso });
                    })
                  );
                } else {
                  this.facturando = false;
                  this.snackBar.open('Factura', `ERROR: ${res.mensaje}`, { duration: 7000 });
                  this.socket.emit('refrescar:mesa', { mesaenuso: this.data.mesaenuso });
                  this.dialogRef.close(res.cuenta);
                }
              })
            );
          } else {
            const confirmRef = this.dialog.open(ConfirmDialogComponent, {
              maxWidth: '400px',
              data: new ConfirmDialogModel('Imprimir recibo', '¿Desea imprimir un recibo?', 'Sí', 'No')
            });
            this.endSubs.add(
              confirmRef.afterClosed().subscribe((confirma: boolean) => {
                if (confirma) {
                  this.printRecibo(res.entidad);
                }
                this.socket.emit('refrescar:mesa', { mesaenuso: this.data.mesaenuso });
                this.dialogRef.close(res.cuenta);
              })
            );
          }
        } else {
          this.facturando = false;
          this.snackBar.open('Cobro', `ERROR: ${res.mensaje}`, { duration: 7000 });
          this.socket.emit('refrescar:mesa', { mesaenuso: this.data.mesaenuso });
          this.dialogRef.close('closePanel');
        }
      })
    );
  }

  enviarPedido = (cobro: Cobro) => {

    this.datosPedido.cliente = {
      nombre: this.datosPedido.nombre,
      apellidos: '',
      correo: this.clienteSelected.correo,
      telefono: this.datosPedido.telefono,
      nit: this.clienteSelected.nit,
      direccion: this.datosPedido.direccion_entrega,
      tiempo_entrega: this.datosPedido.tiempo_entrega || null
    };

    const obj = {
      cobro,
      pedido: this.datosPedido,
      factura: {
        cuentas: [
          {
            cuenta: cobro.cuenta
          }
        ],
        factura_serie: 1,
        cliente: this.clienteSelected.cliente,
        fecha_factura: moment().format(GLOBAL.dbDateFormat),
        moneda: 1
      }
    };

    // console.log('PEDIDO = ', obj); // return;
    this.endSubs.add(
      this.comandaSrvc.enviarPedido(+this.data.mesaenuso.comanda, obj).subscribe(res => {
        this.facturando = false;
        // this.socket.emit('refrescar:mesa', { mesaenuso: this.data.mesaenuso });
        if (res.exito) {
          this.snackBar.open('Pedido', `#${res.pedido}. ${res.mensaje}`, { duration: 3000 });
          this.dialogRef.close('closePanel');
        } else {
          this.snackBar.open('Pedido', `ERROR: ${res.mensaje}`, { duration: 7000 });
        }
      })
    );
  }

  procesaDetalleFactura = (detalle: any[], edu = 0, descripcionUnica: string = null) => {
    const detFact: any[] = [];

    if (edu === 1 && descripcionUnica) {
      let total = 0;
      for (const det of detalle) {
        total += +det.total;
      }
      detFact.push({
        Cantidad: 1,
        Descripcion: descripcionUnica,
        Total: total,
        PrecioUnitario: total
      });
    } else {
      detalle.forEach(d => detFact.push({
        Cantidad: parseInt(d.cantidad),
        Descripcion: d.articulo.descripcion,
        Total: +d.total,
        PrecioUnitario: !!d.precio_unitario ? +d.precio_unitario : +d.precio
      }));
    }

    return detFact;
  }

  getTotalDetalle = (detalle: any[]): number => {
    let suma = 0.00;
    detalle.forEach(d => suma += +d.total);
    return suma;
  }

  getTotalImpuestosAdicionales = (impuestos: any[]) => {
    let suma = 0.00;
    impuestos.forEach(i => suma += +i.total);
    return suma;
  }

  printFactura = (factura: any, cuenta: any = null) => {
    // console.log('FACTURA = ', factura);
    this.endSubs.add(
      this.facturaSrvc.imprimir(+factura.factura).subscribe(res => {
        if (res.factura) {

          const msgToPrint = {
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
            Total: this.getTotalDetalle(res.factura.detalle) + this.getTotalImpuestosAdicionales((res.factura.impuestos_adicionales || [])),
            NoAutorizacion: res.factura.fel_uuid,
            NombreCertificador: res.factura.certificador_fel.nombre,
            NitCertificador: res.factura.certificador_fel.nit,
            FechaDeAutorizacion: res.factura.fecha_autorizacion,
            NoOrdenEnLinea: '',
            FormaDePago: '',
            DetalleFactura: this.procesaDetalleFactura(res.factura.detalle, +res.factura.enviar_descripcion_unica, res.factura.descripcion_unica),
            Impresora: this.data.impresora,
            ImpuestosAdicionales: (res.factura.impuestos_adicionales || [])
          };

          if (!!this.data.impresora) {
            if (+this.data.impresora.bluetooth === 0) {
              this.socket.emit(`print:factura`, `${JSON.stringify(msgToPrint)}`);
            } else {
              msgToPrint.Fecha = moment(res.factura.fecha_factura).format(GLOBAL.dateFormatBT);
              this.printToBT(JSON.stringify(msgToPrint));
            }
          } else {
            this.socket.emit(`print:factura`, `${JSON.stringify(msgToPrint)}`);
          }

          this.snackBar.open(
            `Imprimiendo factura ${res.factura.serie_factura}-${res.factura.numero_factura}`,
            'Impresión', { duration: 3000 }
          );
          this.dialogRef.close(cuenta);
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Impresión', { duration: 7000 });
        }
      })
    );
  }

  printRecibo = (entidad: any) => {

    const msgToPrint: any = {
      NombreEmpresa: entidad.empresa.nombre,
      NitEmpresa: entidad.empresa.nit,
      SedeEmpresa: entidad.sede.nombre,
      DireccionEmpresa: entidad.sede.direccion,
      Fecha: moment().format(GLOBAL.dateFormat),
      Nombre: this.clienteSelected.nombre || entidad.nombre,
      Numero: `${entidad.comanda}-${entidad.numero}`,
      Total: this.getTotalDetalle(entidad.detalle) + +entidad.propina,
      Propina: +entidad.propina,
      DetalleRecibo: this.procesaDetalleFactura(entidad.detalle),
      Impresora: this.data.impresora
    };

    // console.log(JSON.stringify(msgToPrint));

    if (!!this.data.impresora) {
      if (+this.data.impresora.bluetooth === 0) {
        this.socket.emit(`print:recibo`, `${JSON.stringify(msgToPrint)}`);
      } else {
        msgToPrint.Fecha = moment().format(GLOBAL.dateFormatBT);
        this.printToBT(JSON.stringify(msgToPrint));
      }
    } else {
      this.socket.emit(`print:recibo`, `${JSON.stringify(msgToPrint)}`);
    }

    this.snackBar.open(`Imprimiendo recibo ${entidad.comanda}-${entidad.numero}`, 'Impresión', { duration: 3000 });
  }

  printToBT = (msgToPrint: string = '') => {
    const convertir = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_ENVIA_COMO_BASE64);
    const data = convertir ? Base64.encode(msgToPrint, true) : msgToPrint;
    // const AppHref = `${GLOBAL.DEEP_LINK_ANDROID}${data}`;
    const AppHref = GLOBAL.DEEP_LINK_ANDROID.replace('__INFOBASE64__', data);
    try {
      window.location.href = AppHref;
    } catch (error) {
      this.snackBar.open('No se pudo conectar con la aplicación de impresión', 'Comanda', { duration: 3000 });
    }
  }

  onSelectionChangeFP = (msc: MatSelectChange) => {
    const idx = this.lstFormasPago.findIndex(lfp => +lfp.forma_pago === +msc.value);
    if (idx > -1) {
      this.pideDocumento = +this.lstFormasPago[idx].pedirdocumento === 1;
    }
  }

  vaciaDescripcionUnica = () => {
    if (+this.descripcionUnica.enviar_descripcion_unica === 0) {
      this.descripcionUnica.descripcion_unica = null;
    } else {
      this.descripcionUnica.descripcion_unica = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_DETALLE_FACTURA_PERSONALIZADO) || 'Por consumo.';
    }
  }
  
  setSedeAtiende = (dEnt: string = null) => {
    if (dEnt && dEnt.trim() !== '') {
      dEnt = dEnt.trim();
      const de = this.direccionesDeEntrega.find(d => d.direccion_completa?.trim() === dEnt);
      if (de && +de.sede > 0) {
        this.datosPedido.sede = de.sede;
      }
    }
  }
}

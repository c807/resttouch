import { Component, Inject, Input, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectChange } from '@angular/material/select';
import { GLOBAL, isEmail, isNotNullOrUndefined, redondear, seleccionaDocumentoReceptor } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { Base64 } from 'js-base64';
import * as moment from 'moment';

import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { CheckPasswordComponent, ConfigCheckPasswordModel } from '@shared-components/check-password/check-password.component';
import { Socket } from 'ngx-socket-io';

import { FormaPago } from '@pos-interfaces/forma-pago';
import { Cobro } from '@pos-interfaces/cobro';
import { FormaPagoService } from '@pos-services/forma-pago.service';
import { CobroService } from '@pos-services/cobro.service';
import { Cliente } from '@admin-interfaces/cliente';
import { FacturaRequest } from '@pos-interfaces/factura';
import { FacturaService } from '@pos-services/factura.service';
import { Sede } from '@admin-interfaces/sede';
import { SedeService } from '@admin-services/sede.service';
import { ComandaService } from '@restaurante-services/comanda.service';
import { ConfiguracionService } from '@admin-services/configuracion.service';
import { ClienteMasterService } from '@callcenter-services/cliente-master.service';
import { ClienteMasterDireccionResponse, ClienteMasterCliente } from '@callcenter-interfaces/cliente-master';
import { TiempoEntrega } from '@callcenter-interfaces/tiempo-entrega';
import { TiempoEntregaService } from '@callcenter-services/tiempo-entrega.service';
import { TipoDomicilio } from '@callcenter-interfaces/tipo-domicilio';
import { TipoDomicilioService } from '@callcenter-services/tipo-domicilio.service';
import { ValidaPwdGerenteTurnoComponent } from '@restaurante-components/valida-pwd-gerente-turno/valida-pwd-gerente-turno.component';
import { ArticuloTipoCliente } from '@wms-interfaces/articulo-tipo-cliente';
import { ArticuloService } from '@wms-services/articulo.service';
import { Municipio } from '@admin-interfaces/municipio';
import { MunicipioService } from '@admin-services/municipio.service';
import { ComandaGetResponse } from '@restaurante/interfaces/comanda';

import { Subscription } from 'rxjs';

interface DatosPedido {
  sede: number;
  direccion_entrega: string;
  telefono: string;
  nombre: string;
  cliente?: any;
  tiempo_entrega?: number;
  tipo_domicilio?: number;
}

@Component({
  selector: 'app-cobrar-pedido',
  templateUrl: './cobrar-pedido.component.html',
  styleUrls: ['./cobrar-pedido.component.css']
})
export class CobrarPedidoComponent implements OnInit, OnDestroy, AfterViewInit {

  get deshabilitaFormaPagoConAumento() {
    return (opcFp: FormaPago) => {
      return +opcFp.aumento_porcentaje > 0 && this.formasPagoDeCuenta.length > 0;
    }
  }

  get deshabilitaFormaPagoSinAumento() {
    let deshabilitar = false;
    for (const fpc of this.formasPagoDeCuenta) {
      if (+fpc.forma_pago.aumento_porcentaje > 0) {
        deshabilitar = true;
        break;
      }
    }
    return deshabilitar;
  }

  get esCorreoElectronico() {
    return (correo: string) => isEmail(correo);
  }

  get esClienteInvalido(): boolean {
    let esInvalido = false;

    if (this.totalDeCuentaConPropina >= 2500) {
      if (isNotNullOrUndefined(this.clienteSelected)) {
        const documento = seleccionaDocumentoReceptor(this.clienteSelected, this.municipios);
        esInvalido = documento?.documento && documento?.tipo && documento.documento !== 'CF' ? false : true;
      }
    }

    return esInvalido;
  }

  get montoPropina(): number {
    let mntProp = 0;
    for (const fp of this.formasPagoDeCuenta) {
      mntProp += +fp.propina;
    }
    return mntProp;
  }

  get totalDeCuentaConPropina(): number {
    return +this.inputData.totalDeCuenta + this.montoPropina;
  }

  get excedeMontoMaximo(): boolean {
    if (this.formaPago && +this.formaPago.forma_pago > 0) {
      const fp = this.lstFormasPago.find(f => +f.forma_pago === +this.formaPago.forma_pago);
      if (fp && +fp.esabono === 1) {
        const mnt: number = +this.formaPago?.monto || 0;
        const saldoAbono: number = +this.mesaEnUso?.saldo_abono || 0;
        return mnt > saldoAbono;
      }
    }
    return false;
  }

  get montoMaximoDescuento(): number {
    return redondear(+this.inputData.totalDeCuenta * this.porcentajeMaximoDescuento, 2)    
  }

  get excedeMontoMaximoDescuento(): boolean {
    if (this.porcentajeMaximoDescuento !== 0) {      
      // console.log(`Monto: ${+this.formaPago.monto}; Total: ${+this.inputData.totalDeCuenta}; % max: ${this.porcentajeMaximoDescuento}; Saldo: ${+this.inputData.saldo}; Total * % max: ${this.montoMaximoDescuento}`);
      return +this.formaPago.monto > this.montoMaximoDescuento || +this.formaPago.monto > +this.inputData.saldo ;
    }
    return false;
  }

  @Input() inputData: any = {};
  public inputDataOriginal: any = {};
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
  public datosPedido: DatosPedido = {
    sede: null,
    direccion_entrega: null,
    telefono: null,
    nombre: null,
    cliente: null,
    tiempo_entrega: null,
    tipo_domicilio: null
  };
  public descripcionUnica = { enviar_descripcion_unica: 0, descripcion_unica: null };
  public isTipExceeded = false;
  public porcentajeMaximoPropina = 0;
  public SET_PROPINA_AUTOMATICA = false;
  public RT_AUTORIZA_CAMBIO_PROPINA = false;
  public RT_AUTORIZA_CAMBIO_PROPINA_ICON = false;
  public MaxTooltTipMessage = '';
  public direccionesDeEntrega: ClienteMasterDireccionResponse[] = [];
  public tiemposEntrega: TiempoEntrega[] = [];
  public tiposDomicilio: TipoDomicilio[] = [];
  public porcentajeAumento = 1;
  public bloqueaMonto = false;
  public esEfectivo = false;
  public porcentajePropina = 0;
  public aceptaPropinaEnCallCenter = false;
  public seActualizaronLosPrecios = false;
  public varDireccionEntrega = `${GLOBAL.rtDireccionEntrega}_`;
  public varTipoDomicilio = `${GLOBAL.rtTipoDomicilio}_`;
  public varClienteFactura = `${GLOBAL.rtClienteFactura}_`;
  public permiteDetalleFacturaPersonalizado = true;
  public municipios: Municipio[] = [];
  public mesaEnUso: ComandaGetResponse = null;
  public porcentajeMaximoDescuento: number = 0.00;
  public permitirPropina = false;

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
    private tiempoEntregaSrvc: TiempoEntregaService,
    private tipoDomicilioSrvc: TipoDomicilioService,
    private articuloSrvc: ArticuloService,
    private mupioSrvc: MunicipioService
  ) {
  }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.SET_PROPINA_AUTOMATICA = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_PROPINA_AUTOMATICA) as boolean;
    this.RT_AUTORIZA_CAMBIO_PROPINA = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_AUTORIZA_CAMBIO_PROPINA) as boolean;
    this.RT_AUTORIZA_CAMBIO_PROPINA_ICON = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_AUTORIZA_CAMBIO_PROPINA) as boolean;
    this.aceptaPropinaEnCallCenter = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_PROPINA_EN_CALLCENTER) as boolean;
    this.permiteDetalleFacturaPersonalizado = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_PERMITE_DETALLE_FACTURA_PERSONALIZADO) as boolean;

    if (+this.data.mesaenuso.mesa.escallcenter === 1) {
      this.varDireccionEntrega += `${this.data.mesaenuso.mesa.mesa}`;
      this.varTipoDomicilio += `${this.data.mesaenuso.mesa.mesa}`;
      this.varClienteFactura += `${this.data.mesaenuso.mesa.mesa}`;
      if (this.aceptaPropinaEnCallCenter) {
        this.porcentajeMaximoPropina = (this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_PORCENTAJE_MAXIMO_PROPINA) as number) || 10;
        this.porcentajePropina = (this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_PORCENTAJE_PROPINA) as number) || 0;
      } else {
        this.porcentajeMaximoPropina = 0;
        this.porcentajePropina = 0;
      }
    } else {
      this.porcentajeMaximoPropina = (this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_PORCENTAJE_MAXIMO_PROPINA) as number) || 10;
      this.porcentajePropina = (this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_PORCENTAJE_PROPINA) as number) || 0;
    }
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
    this.loadTiposDomicilio();
    this.loadMunicipios();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (+this.data.mesaenuso.mesa.escallcenter === 1) {
      Promise.resolve(null).then(() => this.setDatosPedido());
    }
  }

  autorizaCambioPropina() {
    const dialogoRef = this.dialog.open(ValidaPwdGerenteTurnoComponent, {
      width: '40%', disableClose: true,
      data: { botonMensaje: 'Habilitar' }
    });

    this.endSubs.add(
      dialogoRef.afterClosed().subscribe(res => {
        if (res && res.esgerente) {
          this.RT_AUTORIZA_CAMBIO_PROPINA = false;
        } else {
          this.RT_AUTORIZA_CAMBIO_PROPINA = true;
          this.snackBar.open('La contraseña no es correcta', 'Comanda', { duration: 5000 });
        }
      })
    );
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

    this.mesaEnUso = this.inputData.mesaenuso as ComandaGetResponse;
    // console.log('MESA EN USO = ', this.mesaEnUso);

    this.inputData.porcentajePropina = +this.porcentajePropina;
    this.inputDataOriginal = JSON.parse(JSON.stringify(this.inputData));

    this.calculaTotalDeCuenta();

    this.calculaPropina();
    this.actualizaSaldo();
    this.formaPago.monto = parseFloat(this.inputData.saldo).toFixed(2);
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

  loadTiposDomicilio = () => {
    this.endSubs.add(
      this.tipoDomicilioSrvc.get().subscribe(res => this.tiposDomicilio = res)
    );
  }

  loadMunicipios = () => this.endSubs.add(this.mupioSrvc.get().subscribe(res => this.municipios = res));

  calculaPropina = () => {
    this.inputData.montoPropina = parseFloat((this.inputData.porcentajePropina * this.inputData.totalDeCuenta / 100).toFixed(2));
    this.actualizaSaldo();
  }


  calculaTotalDeCuenta = () => {
    this.inputData.totalDeCuenta = 0.00;
    this.inputData.productosACobrar.forEach((item: any) => {
      let tdc = ((item.precio * item.cantidad) + (item.monto_extra)) * this.porcentajeAumento;
      this.inputData.totalDeCuenta += Math.round((tdc + Number.EPSILON) * 100) / 100;
    });
  }

  loadFormasPago = () => {
    this.endSubs.add(
      this.formaPagoSrvc.get({ activo: 1 }).subscribe((res: FormaPago[]) => {
        if (!!res && res.length > 0) {
          this.lstFormasPago = res;
        }
      })
    );
  }

  addFormaPago = () => {
    // console.log(this.formaPago); return;
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
   * This method calculates the automatic Tip
   */
  calcTipAuto = () => {
    // const tipPorcentaje = this.porcentajeMaximoPropina / 100;
    const tipPorcentaje = this.porcentajePropina / 100;
    // console.log('%PROP = ', this.porcentajePropina);
    const tipLimit = this.inputData.totalDeCuenta * tipPorcentaje;
    let amount = (Number(this.formaPago.propina) || 0.00);

    this.formasPagoDeCuenta.forEach((forP) => {
      amount += Number(forP.propina);
    });

    const tipRestante = tipLimit - amount;

    if (tipRestante >= 0 && this.SET_PROPINA_AUTOMATICA) {
      this.formaPago.propina = tipRestante.toFixed(2);
    }
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
      comision_monto: +this.formaPago.monto * +fp.comision_porcentaje / 100,
      vuelto_para: +this.formaPago.vuelto_para || 0,
      vuelto: +this.formaPago.vuelto || 0,
    });
    this.actualizaSaldo();

    this.pideDocumento = false;
    this.bloqueaMonto = false;
    this.formaPago.forma_pago = null;
    this.esEfectivo = false;
    this.calcTipExceeded();
    this.calcTipAuto()
  }

  delFormaPago = (idx: number) => {
    this.formasPagoDeCuenta.splice(idx, 1);
    this.actualizaSaldo();
    this.calcTipExceeded();
    this.calcTipAuto()
  }

  actualizaSaldo = () => {
    let sumFormasPago = 0.00;
    this.formasPagoDeCuenta.forEach(fp => sumFormasPago += +fp.monto);
    // this.inputData.saldo = this.inputData.totalDeCuenta + this.inputData.montoPropina - sumFormasPago;
    this.inputData.saldo = (+this.inputData.totalDeCuenta - sumFormasPago).toFixed(2);
    this.formaPago = {
      monto: this.inputData.saldo,
      forma_pago: this.formaPago?.forma_pago || null
    };
  }

  cancelar = () => this.dialogRef.close();

  setClienteFacturar = async (obj: Cliente) => {
    if (obj && +obj.cliente > 0) {
      this.clienteSelected = obj;
      this.factReq.cliente = +obj.cliente;
      this.factReq.correo_receptor = obj.correo || null;

      if (obj.tipo_cliente && +obj.tipo_cliente > 0) {
        this.recalculaPrecios(obj);
      } else {
        this.resetPreciosProductosACobrar();
      }
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
        comision_monto: fp.comision_monto,
        aumento_porcentaje: +fp.forma_pago.aumento_porcentaje,
        vuelto_para: +fp.vuelto_para,
        vuelto: +fp.vuelto
      });
    }
    objCobro.comision_monto = sumaMontoComision;
    objCobro.total += sumaMontoComision;
    objCobro.actualizacion_precios = this.seActualizaronLosPrecios;
    objCobro.cliente = this.clienteSelected?.cliente || null;

    // console.log(objCobro); return;

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
                      this.socket.emit('refrescar:mesa', { mesaenuso: this.data.mesaenuso });
                      this.facturando = false;
                    })
                  );
                } else {
                  this.snackBar.open('Factura', `ERROR: ${res.mensaje}`, { duration: 7000 });
                  this.socket.emit('refrescar:mesa', { mesaenuso: this.data.mesaenuso });
                  this.dialogRef.close(res.cuenta);
                  this.facturando = false;
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
          this.snackBar.open('Cobro', `ERROR: ${res.mensaje}`, { duration: 7000 });
          this.socket.emit('refrescar:mesa', { mesaenuso: this.data.mesaenuso });
          this.dialogRef.close('closePanel');
          this.facturando = false;
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
      tiempo_entrega: this.datosPedido.tiempo_entrega || null,
      tipo_domicilio: this.datosPedido.tipo_domicilio || null
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
        // this.socket.emit('refrescar:mesa', { mesaenuso: this.data.mesaenuso });
        if (res.exito) {
          this.ls.clear(`${GLOBAL.rtClientePedido}_${this.data.mesaenuso.mesa.mesa}`);
          this.snackBar.open(`#${res.pedido}. ${res.mensaje}`, 'Pedido', { duration: 3000 });
          this.dialogRef.close('closePanel');
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Pedido', { duration: 7000 });
        }
        this.facturando = false;
      })
    );
  }

  procesaDetalleFactura = (detalle: any[], edu = 0, descripcionUnica: string = null, esRecibo = false) => {
    const detFact: any[] = [];

    if (edu === 1 && descripcionUnica) {
      let total = 0;
      let totalSinDescuento = 0;
      for (const det of detalle) {
        total += +det.total;
        totalSinDescuento += +det.total + +det.descuento;
      }
      detFact.push({
        Cantidad: 1,
        Descripcion: descripcionUnica,
        Total: total,
        PrecioUnitario: total,
        TotalSinDescuento: redondear(totalSinDescuento),
        PrecioUnitarioSinDescuento: redondear(totalSinDescuento)
      });
    } else {
      detalle.forEach(d => detFact.push({
        Cantidad: parseInt(d.cantidad),
        Descripcion: d.articulo.descripcion,
        Total: +d.total + (esRecibo ? +d.monto_extra : 0),
        TotalSinDescuento: redondear((+d.total + (esRecibo ? +d.monto_extra : 0)) + +d.descuento),
        PrecioUnitario: (!!d.precio_unitario ? +d.precio_unitario : +d.precio) + (esRecibo ? +d.monto_extra : 0),
        PrecioUnitarioSinDescuento: redondear((!!d.precio_unitario ? +d.precio_unitario : +d.precio) + (esRecibo ? +d.monto_extra : 0))
      }));
    }

    return detFact;
  }

  getTotalDetalle = (detalle: any[], esRecibo = false): number => {
    let suma = 0.00;
    detalle.forEach(d => suma += (+d.total + (esRecibo ? +d.monto_extra : 0)));
    return suma;
  }

  getTotalImpuestosAdicionales = (impuestos: any[]) => {
    let suma = 0.00;
    impuestos.forEach(i => suma += +i.total);
    return suma;
  }

  getTotalDescuento = (detalle: any[]): number => {
    let suma = 0.00;
    detalle.forEach(d => suma += +d.descuento);
    return suma;
  }

  printFactura = (factura: any, cuenta: any = null) => {
    // console.log('FACTURA = ', factura);
    this.endSubs.add(
      this.facturaSrvc.imprimir(+factura.factura).subscribe(res => {
        if (res.factura) {
          // console.log('FACTURA = ', res.factura);
          // console.log('CUENTA = ', cuenta);
          // console.log('MESA = ', this.data.mesaenuso);
          const totalDeDescuento = this.getTotalDescuento(res.factura.detalle);
          const msgToPrint = {
            IdFactura: +res.factura.factura || 0,
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
            TotalSinDescuento: 0,
            NoAutorizacion: res.factura.fel_uuid,
            NombreCertificador: res.factura.certificador_fel.nombre,
            NitCertificador: res.factura.certificador_fel.nit,
            FechaDeAutorizacion: res.factura.fecha_autorizacion,
            NoOrdenEnLinea: '',
            FormaDePago: '',
            DetalleFactura: this.procesaDetalleFactura(res.factura.detalle, +res.factura.enviar_descripcion_unica, res.factura.descripcion_unica),
            Impresora: this.data.impresora,
            ImpuestosAdicionales: (res.factura.impuestos_adicionales || []),
            EsReimpresion: false,
            Comanda: +cuenta.comanda || 0,
            Cuenta: +cuenta.cuenta || 0,
            DatosComanda: res.factura.datos_comanda || null,
            TotalDescuento: redondear(totalDeDescuento)
          };
          msgToPrint.TotalSinDescuento = redondear(+msgToPrint.Total + totalDeDescuento);

          // console.log('FACTURA = ', msgToPrint);

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
      Total: this.getTotalDetalle(entidad.detalle, true) + +entidad.propina,
      Propina: +entidad.propina,
      DetalleRecibo: this.procesaDetalleFactura(entidad.detalle, 0, null, true),
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
      // console.log(this.lstFormasPago[idx]);

      if (+this.lstFormasPago[idx].porcentaje_maximo_descuento !== 0) {
        this.porcentajeMaximoDescuento = +this.lstFormasPago[idx].porcentaje_maximo_descuento / 100;
      } else {
        this.porcentajeMaximoDescuento = 0.00;
      }

      this.permitirPropina = +this.lstFormasPago[idx].permitir_propina == 1

      this.pideDocumento = +this.lstFormasPago[idx].pedirdocumento === 1;
      this.esEfectivo = +this.lstFormasPago[idx].esefectivo === 1;
      if (+this.lstFormasPago[idx].aumento_porcentaje > 0) {
        this.porcentajeAumento = 1;
        this.porcentajeAumento += +this.lstFormasPago[idx].aumento_porcentaje / 100;
        this.bloqueaMonto = true;
      } else {
        this.porcentajeAumento = 1;
        this.bloqueaMonto = false;
      }
      this.calculaTotalDeCuenta();
      this.actualizaSaldo();
    }
    this.calcTipAuto();

    if (+this.lstFormasPago[idx].esabono === 1 || !this.permitirPropina) {
      this.formaPago.propina = 0.00;
    }
  }

  vaciaDescripcionUnica = () => {
    if (+this.descripcionUnica.enviar_descripcion_unica === 0) {
      this.descripcionUnica.descripcion_unica = null;
    } else {
      this.descripcionUnica.descripcion_unica = (this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_DETALLE_FACTURA_PERSONALIZADO) as string) || 'Por consumo.';
    }
  }

  setSedeAtiende = (dEnt: string = null) => {
    if (dEnt && dEnt.trim() !== '') {
      dEnt = dEnt.trim();
      const de = this.direccionesDeEntrega.find(d => d.direccion_completa?.trim() === dEnt);
      if (de.sede && +de.sede.sede > 0) {
        this.datosPedido.sede = de.sede.sede;
      }
    }
  }

  calculaVuelto = (fp: any) => {
    const monto = +fp.monto || 0;
    const propina = +fp.propina || 0;
    if (this.esEfectivo && +fp.vuelto_para > (monto + propina)) {
      this.formaPago.vuelto = +fp.vuelto_para - (monto + propina);
    } else {
      this.formaPago.vuelto = 0;
    }
  }

  recalculaPrecios = async (cli: Cliente) => {
    let huboCambioPrecio = false;
    const params = {
      _flat: 1, _uno: true, tipo_cliente: cli.tipo_cliente, articulo: null
    }
    // console.log('A cobrar = ', this.inputData.productosACobrar);

    for (const pac of this.inputData.productosACobrar) {
      params.articulo = pac.id;
      const atc: ArticuloTipoCliente = (await this.articuloSrvc.getArticulosPorTipoCliente(params).toPromise()) as ArticuloTipoCliente;
      if (atc) {
        // console.log('ART TIP CLI = ', atc);
        pac.precio = +atc.precio;
        huboCambioPrecio = true;
      }
    }

    if (huboCambioPrecio) {
      this.formasPagoDeCuenta = [];
      this.porcentajeMaximoDescuento = 0.00;
      this.calculaTotalDeCuenta();
      this.calculaPropina();
      this.actualizaSaldo();
      this.formaPago.monto = parseFloat(this.inputData.saldo).toFixed(2);
    } else {
      this.resetPreciosProductosACobrar();
    }

    this.seActualizaronLosPrecios = huboCambioPrecio;
  }

  resetPreciosProductosACobrar = () => {
    this.inputData.productosACobrar = JSON.parse(JSON.stringify(this.inputDataOriginal.productosACobrar));
    this.formasPagoDeCuenta = [];
    this.porcentajeMaximoDescuento = 0.00;
    this.calculaTotalDeCuenta();
    this.calculaPropina();
    this.actualizaSaldo();
    this.formaPago.monto = parseFloat(this.inputData.saldo).toFixed(2);
    this.calcTipAuto();
  }

  setDatosPedido = () => {
    // Tipo de domicilio
    const tipoDomi: TipoDomicilio = this.ls.get(this.varTipoDomicilio) || null;
    if (tipoDomi) {
      this.datosPedido.tipo_domicilio = tipoDomi.tipo_domicilio || null;
    }

    //Dirección de entrega
    const dirEntrega: ClienteMasterDireccionResponse = this.ls.get(this.varDireccionEntrega) || null;
    if (dirEntrega) {
      this.datosPedido.direccion_entrega = dirEntrega.direccion_completa || null;
      this.datosPedido.sede = dirEntrega.sede.sede || null;
    }

    //Datos de facturacion
    const datosFact: ClienteMasterCliente = this.ls.get(this.varClienteFactura) || null;
    if (datosFact) {
      this.setClienteFacturar(datosFact.cliente);
    }
  }

  setPropina = () => {
    if (this.SET_PROPINA_AUTOMATICA) {
      const tipPorcentaje = +this.porcentajePropina / 100;
      const tipAmount = +this.formaPago.monto * tipPorcentaje;
      this.formaPago.propina = tipAmount.toFixed(2);
    }

    if (this.formaPago && +this.formaPago.forma_pago > 0) {
      const fp = this.lstFormasPago.find(f => +f.forma_pago === +this.formaPago.forma_pago);
      if (fp && (+fp.esabono === 1 || !this.permitirPropina)) {
        this.formaPago.propina = 0.00;
      }
    }
  }
}

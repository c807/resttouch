import { Socket } from 'ngx-socket-io';
import { ProductoSelected } from '../../wms/interfaces/articulo';
import { LocalstorageService } from '../../admin/services/localstorage.service';
import { ComandaService } from '../services/comanda.service';
import { ConfiguracionService } from '../../admin/services/configuracion.service';
import { GLOBAL } from '../../shared/global';
import { Base64 } from 'js-base64';
import * as moment from 'moment';
import { Impresora } from '../../admin/interfaces/impresora';
import { Correlativo } from '../../admin/interfaces/correlativo';
import { CorrelativoService } from '../../admin/services/correlativo.service';

export class Impresion {

    public impresoraPorDefecto: Impresora = null;

    constructor(
        private socket: Socket,
        private ls?: LocalstorageService,
        private comandaSrvc?: ComandaService,
        private configSrvc?: ConfiguracionService,
        private correlativoSrvc?: CorrelativoService
    ) { }

    private setToPrint = (articulos: any[]) => {
        const lstArticulos: any[] = [];
        articulos.forEach(item => {
            lstArticulos.push({
                id: +item.articulo.articulo,
                nombre: item.articulo.descripcion,
                cantidad: +item.cantidad,
                total: +item.total,
                notas: item.notas || '',
                impresora: {
                    impresora: +item.articulo.impresora.impresora,
                    sede: +item.articulo.impresora.sede,
                    nombre: item.articulo.impresora.nombre || '',
                    direccion_ip: item.articulo.impresora.direccion_ip || '',
                    ubicacion: item.articulo.impresora.ubicacion || '',
                    bluetooth: +item.articulo.impresora.bluetooth,
                    bluetooth_mac_address: item.articulo.impresora.bluetooth_mac_address || ''
                },
                detalle: item.detalle
            });
        });
        return lstArticulos;
    }

    private printToBT = (msgToPrint: string = '') => {        
        const convertir = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_ENVIA_COMO_BASE64);
        const data = convertir ? Base64.encode(msgToPrint, true) : msgToPrint;
        const AppHref = GLOBAL.DEEP_LINK_ANDROID.replace('__INFOBASE64__', data);
        
        try {
            window.location.href = AppHref;
        } catch (error) {
            console.log(error);
        }
    }

    marcarComoImpresa = async (obj: any) => {
        await this.comandaSrvc.setProductoImpreso(obj.cuentas[0].cuenta).toPromise();
    }

    imprimir = async (obj: any, idx: number = 0) => {
        const listaProductos = this.setToPrint(obj.cuentas[0].productos);
        const AImpresoraNormal: ProductoSelected[] = listaProductos.filter(p => +p.impresora.bluetooth === 0);
        const AImpresoraBT: ProductoSelected[] = listaProductos.filter(p => +p.impresora.bluetooth === 1);

        const correlativo: Correlativo = await this.correlativoSrvc.get().toPromise();

        let objToPrint = {};

        if (AImpresoraNormal.length > 0) {
            objToPrint = {
                Indice: (idx + 1),
                Tipo: 'Comanda',
                Nombre: obj.cuentas[0].nombre,
                Numero: obj.comanda,
                NoOrdenEnLinea: obj.origen_datos.numero_orden,
                DireccionEntrega: obj.origen_datos.direccion_entrega,
                DetalleCuenta: AImpresoraNormal,
                Total: 0.00,
                NotasGenerales: obj.notas_generales || '',
                FormasPago: obj.formas_pago || [],
                TipoDomicilio: obj.tipo_domicilio?.descripcion || '',
                EsReimpresion: obj.EsReimpresion || false,
                NumeroImpresion: correlativo.siguiente || 1
            };
            this.socket.emit('print:comanda', `${JSON.stringify(objToPrint)}`);
        }

        if (AImpresoraBT.length > 0) {
            objToPrint = {
                Tipo: 'Comanda',
                Nombre: obj.cuentas[0].nombre,
                Numero: obj.comanda,
                NoOrdenEnLinea: obj.origen_datos.numero_orden,
                DireccionEntrega: obj.origen_datos.direccion_entrega,
                DetalleCuenta: AImpresoraBT,
                Total: 0.00,
                NotasGenerales: obj.notas_generales || '',
                FormasPago: obj.formas_pago || [],
                TipoDomicilio: obj.tipo_domicilio?.descripcion || '',
                EsReimpresion: obj.EsReimpresion || false,
                NumeroImpresion: correlativo.siguiente || 1
            };
            this.printToBT(JSON.stringify(objToPrint));
        }

        await this.marcarComoImpresa(obj);
    }

    private sumaDetalle = (detalle: ProductoSelected[]) => {
        let total = 0.00;
        // for (let i = 0; i < detalle.length; i++) { total += detalle[i].total || 0.00; }
        for (const item of detalle) {
            total += +item.total || 0.00;
            total += +item.monto_extra || 0.00;
            total += +item.aumento || 0.00;
        }
        return total;
    }

    imprimirCuenta = (obj: any) => {
        const cuentaActiva = obj.cuentas[0];
        // console.log('CUENTA = ', cuentaActiva);
        const lstProductosDeCuenta = cuentaActiva.productos;
        // console.log('PRODUCTOS = ', lstProductosDeCuenta);
        const lstProductosAImprimir = lstProductosDeCuenta.map(p => {
            p.Nombre = p.articulo.descripcion;
            return p;
        });
        // console.log('A IMPRIMIR = ', lstProductosDeCuenta);
        const mesaEnUso = obj.mesa;

        if (lstProductosAImprimir.length > 0) {
            const totalCuenta = this.sumaDetalle(lstProductosAImprimir);
            const printerToUse = obj.impresora_defecto_cuenta || obj.impresora_defecto;
            const imprimePropSugerida = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_IMPRIME_PROPINA_SUGERIDA);
            const ngen = +obj.domicilio === 1 ? (obj.notas_generales || null) : null;

            const msgToPrint = {
                Tipo: 'Cuenta',
                Nombre: cuentaActiva.nombre,
                Numero: +cuentaActiva.numero || 0,
                DetalleCuenta: lstProductosAImprimir,
                Total: totalCuenta,
                Empresa: this.ls.get(GLOBAL.usrTokenVar).empresa,
                Restaurante: this.ls.get(GLOBAL.usrTokenVar).restaurante,
                PropinaSugerida: imprimePropSugerida ? (totalCuenta * 0.10).toFixed(2) : null,
                Impresora: printerToUse,
                Ubicacion: mesaEnUso && mesaEnUso.area ? `${mesaEnUso.area.nombre} - Mesa ${mesaEnUso.etiqueta || mesaEnUso.numero} - Comanda ${obj.comanda}` : `Comanda ${obj.comanda}`,
                Mesero: (`${obj.mesero.nombres || ''} ${obj.mesero.apellidos || ''}`).trim(),
                DireccionEntrega: obj.origen_datos.direccion_entrega,
                FormasPago: obj.formas_pago || [],
                TipoDomicilio: obj.tipo_domicilio?.descripcion || '',
                IdComanda: +obj.comanda || 0,
                IdCuenta: +cuentaActiva.cuenta || 0,
                DatosFacturacion: obj.datos_facturacion || null,
                NotasGenerales: ngen
            };

            // console.log('CUENTA = ', msgToPrint);

            if (+printerToUse.bluetooth === 0) {
                this.socket.emit(`print:cuenta`, `${JSON.stringify(msgToPrint)}`);
            } else {
                this.printToBT(JSON.stringify(msgToPrint));
            }
        }
    }

    imprimirCorteCaja = (obj: any) => {
        const printerToUse = obj.Impresora || null;
        if (!printerToUse || +printerToUse?.bluetooth === 0) {
            this.socket.emit(`print:corte_caja`, `${JSON.stringify(obj)}`);
        } else {
            this.printToBT(JSON.stringify(obj));
        }
    }

    imprimirABT = (msgToPrint: string = '') => this.printToBT(msgToPrint);

    imprimirAnulacionProducto = (obj: any) => {
        if (+obj.impresora.bluetooth === 0) {
            this.socket.emit(`print:anulacion_producto`, `${JSON.stringify(obj)}`);
        } else {
            this.printToBT(JSON.stringify(obj));
        }
    }

    anulacionDeFactura = (factura: any, anulacion: any) => {
        const obj = {
            Serie: factura.serie_factura,
            Numero: factura.numero_factura,
            FechaFactura: moment(factura.fecha_factura).format(GLOBAL.dateFormat),
            Cliente: anulacion.cliente.nombre,
            NIT: anulacion.cliente.nit,
            FechaAnulacion: anulacion.fecha,
            Comentario: anulacion.comentario,
            Impresora: (factura.impresora as Impresora) || this.impresoraPorDefecto
        }        

        if (+obj.Impresora.bluetooth === 0) {
            this.socket.emit(`print:anulacion_factura`, `${JSON.stringify(obj)}`);
        } else {
            this.printToBT(JSON.stringify(obj));
        }
    }

    imprimirFactura = (fact: any, datosOrigen: any = {}, comanda: any = {}) => {
        const dataToPrint = {
          IdFactura: +fact.factura || 0,
          NombreEmpresa: fact.empresa.nombre_comercial,
          NitEmpresa: fact.empresa.nit,
          SedeEmpresa: fact.sedeFactura.nombre,
          DireccionEmpresa: fact.empresa.direccion,
          Fecha: moment(fact.fecha_factura).format(GLOBAL.dateFormat),
          Nit: fact.receptor.nit,
          Nombre: fact.receptor.nombre,
          Direccion: fact.receptor.direccion,
          Serie: fact.serie_factura,
          Numero: fact.numero_factura,
          Total: 0.00,
          NoAutorizacion: fact.fel_uuid,
          NombreCertificador: fact.certificador_fel.nombre,
          NitCertificador: fact.certificador_fel.nit,
          FechaDeAutorizacion: fact.fecha_autorizacion,
          NoOrdenEnLinea: datosOrigen.numero_orden,
          FormaDePago: (datosOrigen.metodo_pago && datosOrigen.metodo_pago.length > 0) ? datosOrigen.metodo_pago.join(', ') : '',
          DetalleFactura: [],
          Comanda: comanda.comanda || 0,
          Cuenta: comanda.cuentas[0].cuenta || 0,
          DatosComanda: fact.datos_comanda || null,
          Impresora: (null as Impresora)
        };
    
        for (const det of fact.detalle) {
          dataToPrint.DetalleFactura.push({
            Cantidad: parseInt(det.cantidad),
            Descripcion: det.articulo.descripcion,
            Total: parseFloat(det.total),
            PrecioUnitario: +det.precio_unitario
          });
          dataToPrint.Total += parseFloat(det.total);
        }
    
        if (comanda.impresora_defecto_factura || this.impresoraPorDefecto) {
          dataToPrint.Impresora = comanda.impresora_defecto_factura || this.impresoraPorDefecto;
          if (+dataToPrint.Impresora.bluetooth === 0) {
            this.socket.emit('print:factura', JSON.stringify(dataToPrint));
          } else {            
            this.printToBT(JSON.stringify(dataToPrint));
          }
        } else {
          this.socket.emit('print:factura', JSON.stringify(dataToPrint));
        }
      }
}
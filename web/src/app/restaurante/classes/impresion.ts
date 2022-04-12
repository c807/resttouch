import { Socket } from 'ngx-socket-io';
import { ProductoSelected } from '../../wms/interfaces/articulo';
import { LocalstorageService } from '../../admin/services/localstorage.service';
import { ComandaService } from '../services/comanda.service';
import { ConfiguracionService } from '../../admin/services/configuracion.service';
import { GLOBAL } from '../../shared/global';

export class Impresion {

    constructor(
        private socket: Socket,
        private ls: LocalstorageService,
        private comandaSrvc?: ComandaService,
        private configSrvc?: ConfiguracionService
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
                    bluetooth: +item.articulo.impresora.bluetooth,
                    direccion_ip: item.articulo.impresora.direccion_ip || '',
                    impresora: +item.articulo.impresora.impresora,
                    nombre: item.articulo.impresora.nombre || '',
                    sede: +item.articulo.impresora.sede,
                    ubicacion: item.articulo.impresora.ubicacion || ''
                },
                detalle: item.detalle
            });
        });
        return lstArticulos;
    }

    private printToBT = (msgToPrint: string = '') => {
        const AppHref = `com.restouch.impresion://impresion/${msgToPrint}`;
        const wref = window.open(AppHref, 'PrntBT', 'height=200,width=200,menubar=no,location=no,resizable=no,scrollbars=no,status=no');
        setTimeout(() => wref.close(), 1000);
    }

    marcarComoImpresa = async (obj: any) => {
        await this.comandaSrvc.setProductoImpreso(obj.cuentas[0].cuenta).toPromise();
    }

    imprimir = async (obj: any, idx: number = 0) => {
        const listaProductos = this.setToPrint(obj.cuentas[0].productos);
        const AImpresoraNormal: ProductoSelected[] = listaProductos.filter(p => +p.impresora.bluetooth === 0);
        const AImpresoraBT: ProductoSelected[] = listaProductos.filter(p => +p.impresora.bluetooth === 1);

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
                EsReimpresion: obj.EsReimpresion || false
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
                EsReimpresion: obj.EsReimpresion || false
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
            const printerToUse = obj.impresora_defecto;
            const imprimePropSugerida = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_IMPRIME_PROPINA_SUGERIDA);

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
                Ubicacion: `${mesaEnUso.area.nombre} - Mesa ${mesaEnUso.etiqueta || mesaEnUso.numero} - Comanda ${obj.comanda}`,
                Mesero: `${obj.mesero.nombres} ${obj.mesero.apellidos}`,
                DireccionEntrega: obj.origen_datos.direccion_entrega,
                FormasPago: obj.formas_pago || [],
                TipoDomicilio: obj.tipo_domicilio?.descripcion || '',
                IdComanda: +obj.comanda || 0,
                IdCuenta: +cuentaActiva.cuenta || 0,
                DatosFacturacion: obj.datos_facturacion || null
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

}
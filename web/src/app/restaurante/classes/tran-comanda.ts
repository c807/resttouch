import { EventEmitter } from '@angular/core';
import { WindowConfiguration } from '../../shared/interfaces/window-configuration';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Socket } from 'ngx-socket-io';
import { LocalstorageService } from '../../admin/services/localstorage.service';
import { GLOBAL } from '../../shared/global';
import { MatInput } from '@angular/material/input';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { UnirCuentaComponent } from '../components/unir-cuenta/unir-cuenta.component';
import { TrasladoMesaComponent } from '../components/traslado-mesa/traslado-mesa.component';
import { CobrarPedidoComponent } from '../../pos/components/cobrar-pedido/cobrar-pedido.component';
import { ListaProductoAltComponent } from '../../wms/components/producto/lista-producto-alt/lista-producto-alt.component';
import { ConfirmDialogModel, DialogPedidoComponent } from '../../shared/components/dialog-pedido/dialog-pedido.component';
import { ConfirmDialogComboModel, DialogComboComponent } from '../../shared/components/dialog-combo/dialog-combo.component';
import { NotasGeneralesComandaComponent } from '../components/notas-generales-comanda/notas-generales-comanda.component';
import { NuevaCuentaComponent } from '../components/nueva-cuenta/nueva-cuenta.component';
import { DistribuirProductosCuentasComponent } from '../components/distribuir-productos-cuentas/distribuir-productos-cuentas.component';
import { TranComandaAltComponent } from '../components/tran-comanda-alt/tran-comanda-alt.component';

import { Cuenta } from '../interfaces/cuenta';
import { Comanda, ComandaGetResponse } from '../interfaces/comanda';
import { DetalleComanda } from '../interfaces/detalle-comanda';
import { Articulo, ArbolArticulos, ProductoSelected, NodoProducto } from '../../wms/interfaces/articulo';
import { ArticuloService } from '../../wms/services/articulo.service';

import { ComandaService } from '../services/comanda.service';
import { ReportePdfService } from '../services/reporte-pdf.service';
import { ConfiguracionService } from '../../admin/services/configuracion.service';
import { Cliente } from '../../admin/interfaces/cliente';
import { Categoria } from '../../wms/interfaces/categoria';

import { AccionesComandaComponent } from '../components/acciones-comanda/acciones-comanda.component';
import { Base64 } from 'js-base64';

export class TranComanda {
    public mesaEnUso: ComandaGetResponse;
    public clientePedido: Cliente = null;
    public closeSideNavEv = new EventEmitter();
    public appLstProdAlt: ListaProductoAltComponent;
    public mesaSavedEv = new EventEmitter();
    public txtCodigoBarras: MatInput;

    public lstProductosSeleccionados: ProductoSelected[];
    public lstProductosDeCuenta: ProductoSelected[];
    public lstProductosAImprimir: ProductoSelected[];
    public showPortalComanda = false;
    public showPortalCuenta = false;
    public windowConfig: WindowConfiguration;
    public noComanda = 0;
    public sumCuenta = 0;
    public cuentaActiva: Cuenta;
    public detalleComanda: DetalleComanda;
    public categorias: (ArbolArticulos[] | Categoria[]) = [];
    public bloqueoBotones = false;
    public rolesUsuario: string[] = [];
    public impreso = 0;
    public usaCodigoBarras = false;
    public codigoBarras: string = null;
    public imprimeRecetaEnComanda = true;

    constructor(
        public dialog: MatDialog,
        protected snackBar: MatSnackBar,
        public comandaSrvc: ComandaService,
        protected socket: Socket,
        protected ls: LocalstorageService,
        protected pdfServicio: ReportePdfService,
        protected configSrvc: ConfiguracionService,
        protected articuloSrvc: ArticuloService,
        protected bsAccionesCmd: MatBottomSheet
    ) { }

    alIniciar = () => {
        // this.resetMesaEnUso();
        this.resetLstProductosSeleccionados();
        this.resetLstProductosDeCuenta();
        this.resetCuentaActiva();
        this.impreso = 0;
        this.noComanda = this.mesaEnUso.comanda || 0;
        this.llenaProductosSeleccionados();
        if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
            this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);
            this.socket.on('reconnect', () => this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid));
        }
        this.usaCodigoBarras = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_USA_CODIGO_BARRAS);
        this.imprimeRecetaEnComanda = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_IMPRIME_RECETA_EN_COMANDA);
        // console.log('MESA EN USO = ', this.mesaEnUso);
    }

    resetMesaEnUso = () => this.mesaEnUso = {
        exito: true,
        comanda: null, usuario: null, sede: null, estatus: null,
        mesa: {
            mesa: null,
            area: { area: null, sede: null, area_padre: null, nombre: null },
            numero: null, posx: null, posy: null, tamanio: null, estatus: null
        },
        numero_pedido: null,
        cuentas: []
    }
    resetLstProductosSeleccionados = () => this.lstProductosSeleccionados = [];
    resetLstProductosDeCuenta = () => this.lstProductosDeCuenta = [];
    resetCuentaActiva = () => this.cuentaActiva = { cuenta: null, numero: null, nombre: null, productos: [] };
    resetListadoArticulos = () => this.appLstProdAlt.loadArbolArticulos();

    setListaCategorias = (cats: ArbolArticulos[] = []) => this.categorias = this.setVerBotones(cats);

    setVerBotones = (cats: ArbolArticulos[]) => {
        for (const cat of cats) {
            loopSubCategoria:
            for (const subcat of cat.categoria_grupo) {
                for (const art of subcat.articulo) {
                    if (+art.mostrar_pos === 1) {
                        subcat.mostrarEnPos = true;
                        cat.mostrarEnPos = true;
                        continue loopSubCategoria;
                    }
                }
            }
        }
        return cats;
    }

    clickOnCategoria = (c: ArbolArticulos) => this.appLstProdAlt.fillSubCategorias(c.categoria_grupo);

    buscarArticulo = () => {
        // console.log(`CODIGO BARRAS = ${this.codigoBarras}`);
        if (this.codigoBarras && this.codigoBarras.trim().length > 0) {
            this.articuloSrvc.getArticulos({ codigo: this.codigoBarras.trim() }).subscribe((arts: Articulo[]) => {
                if (arts && arts.length > 0) {
                    const art = arts[0];
                    const obj: NodoProducto = {
                        id: +art.articulo,
                        nombre: art.descripcion,
                        precio: +art.precio,
                        impresora: art.impresora,
                        presentacion: art.presentacion,
                        codigo: art.codigo,
                        combo: art.combo,
                        multiple: art.multiple
                    };
                    this.agregarProductos(obj);
                }
                this.codigoBarras = null;
                this.txtCodigoBarras.focus();
            });
        }
    }

    llenaProductosSeleccionados = (conQueMesa: ComandaGetResponse = this.mesaEnUso) => {
        if (this.mesaEnUso.comanda == null) {
            this.mesaEnUso = conQueMesa;
        }
        this.lstProductosSeleccionados = [];

        for (const ctas of conQueMesa.cuentas) {
            for (const p of ctas.productos) {
                this.lstProductosSeleccionados.push({
                    id: +p.articulo.articulo,
                    nombre: p.articulo.descripcion,
                    cuenta: +p.numero_cuenta || 1,
                    idcuenta: +ctas.cuenta,
                    cantidad: +p.cantidad,
                    impreso: +p.impreso,
                    precio: parseFloat(p.precio) || 10.00,
                    total: parseFloat(p.total) || (parseFloat(p.cantidad) * parseFloat(p.precio)),
                    notas: p.notas || '',
                    showInputNotas: false,
                    itemListHeight: '70px',
                    detalle_comanda: +p.detalle_comanda,
                    detalle_cuenta: +p.detalle_cuenta,
                    impresora: p.articulo.impresora,
                    detalle: p.detalle,
                    monto_extra: +p.monto_extra || 0.00,
                    multiple: +p.articulo.multiple,
                    combo: +p.articulo.combo
                });
            }
        }
        // console.log('SELECCIONADOS = ', this.lstProductosSeleccionados);
    }

    cerrarMesa = () => {
        // console.log('CERRAR MESA; MESA EN USO = ', this.mesaEnUso);
        this.comandaSrvc.cerrarMesa(this.mesaEnUso.mesa.mesa).subscribe(res => {
            // console.log('RESPUESTA DE CERRAR MESA = ', res);
            if (res.exito) {
                // console.log('EXITO PARA CERRAR LA MESA...', res);
                this.snackBar.open(res.mensaje, 'Comanda', { duration: 3000 });
                this.mesaEnUso.mesa.estatus = 1;
                // this.closeSideNavEv.emit();
                this.mesaSavedEv.emit();
                this.socket.emit('refrescar:mesa', { mesaenuso: this.mesaEnUso });
            } else {
                // console.log('FALLA PARA CERRAR LA MESA...', res);
                this.snackBar.open(`ERROR: ${res.mensaje}`, 'Comanda', { duration: 7000 });
            }
        });
    }

    setSelectedCuenta(noCuenta: number) {
        this.bloqueoBotones = true;
        this.cuentaActiva = this.mesaEnUso.cuentas.find((c: Cuenta) => +c.numero === +noCuenta);
        this.setLstProductosDeCuenta();
        this.bloqueoBotones = false;
    }

    setSumaCuenta(lista: ProductoSelected[]) {
        let suma = 0.00;
        // for (let i = 0; i < lista.length; i++) { suma += (lista[i].precio * lista[i].cantidad); }
        for (const item of lista) {
            suma += (item.precio * item.cantidad);
        }
        this.sumCuenta = suma;
    }

    setLstProductosDeCuenta() {
        this.lstProductosDeCuenta = this.lstProductosSeleccionados.filter(p => +p.cuenta === +this.cuentaActiva.numero);
        // console.log(this.lstProductosDeCuenta);
    }

    agregarProductos(producto: any) {
        // console.log(producto);
        if (+producto.combo === 1 || +producto.multiple === 1) {
            this.bloqueoBotones = true;
            const confirmRef = this.dialog.open(DialogComboComponent, {
                maxWidth: '50%',
                data: new ConfirmDialogComboModel(
                    producto,
                    'Sí', 'No'
                )
            });

            confirmRef.afterClosed().subscribe((res: any) => {
                // console.log(res);
                if (res && res.respuesta && res.seleccion.receta.length > 0) {
                    // console.log(res.seleccion); // this.bloqueoBotones = false; return;
                    this.comandaSrvc.saveDetalleCombo(
                        this.mesaEnUso.comanda,
                        this.cuentaActiva.cuenta, res.seleccion
                    ).subscribe(resSaveDetCmb => {
                        // console.log('NUEVO DETALLE COMANDA = ', res);
                        if (resSaveDetCmb.exito) {
                            this.mesaEnUso = resSaveDetCmb.comanda;
                            this.llenaProductosSeleccionados(this.mesaEnUso);
                            this.setSelectedCuenta(+this.cuentaActiva.numero);
                        } else {
                            this.snackBar.open(`ERROR:${resSaveDetCmb.mensaje}`, 'Comanda', { duration: 3000 });
                        }
                        this.bloqueoBotones = false;
                    });
                } else {
                    this.bloqueoBotones = false;
                    this.snackBar.open('Error, Debe seleccionar los productos del combo', 'Comanda', { duration: 7000 });
                }
            });
        } else {
            this.addProductoSelected(producto);
        }
    }

    addProductoSelected(producto: any) {
        // console.log('PRODUCTO = ', producto);
        // return;
        this.bloqueoBotones = true;
        if (+this.cuentaActiva.numero) {
            const idx = this.lstProductosSeleccionados
                .findIndex(p => +p.id === +producto.id && +p.cuenta === +this.cuentaActiva.numero && +p.impreso === 0);

            if (idx < 0) {
                this.detalleComanda = {
                    articulo: producto.id, cantidad: 1, precio: +producto.precio, total: 1 * +producto.precio, notas: ''
                };
                this.comandaSrvc.saveDetalle(this.mesaEnUso.comanda, this.cuentaActiva.cuenta, this.detalleComanda).subscribe(res => {
                    // console.log('NUEVO DETALLE COMANDA = ', res);
                    if (res.exito) {
                        this.mesaEnUso = res.comanda;
                        this.llenaProductosSeleccionados(this.mesaEnUso);
                        this.setSelectedCuenta(+this.cuentaActiva.numero);
                    } else {
                        this.snackBar.open(`ERROR:${res.mensaje}`, 'Comanda', { duration: 3000 });
                    }
                    this.bloqueoBotones = false;
                });
            } else {
                const tmp: ProductoSelected = this.lstProductosSeleccionados[idx];
                this.detalleComanda = {
                    detalle_cuenta: tmp.detalle_cuenta, detalle_comanda: tmp.detalle_comanda, articulo: tmp.id,
                    cantidad: (+tmp.cantidad) + 1, precio: +tmp.precio, total: ((+tmp.cantidad) + 1) * (+tmp.precio),
                    notas: tmp.notas
                };
                this.comandaSrvc.saveDetalle(this.mesaEnUso.comanda, this.cuentaActiva.cuenta, this.detalleComanda).subscribe(res => {
                    // console.log('UPDATE DETALLE COMANDA = ', res);
                    if (res.exito) {
                        this.mesaEnUso = res.comanda;
                        this.llenaProductosSeleccionados(this.mesaEnUso);
                        this.setSelectedCuenta(+this.cuentaActiva.numero);
                    } else {
                        this.snackBar.open(`ERROR:${res.mensaje}`, 'Comanda', { duration: 3000 });
                    }
                    this.bloqueoBotones = false;
                });
            }
            this.setLstProductosDeCuenta();
        }
    }

    updProductosCuenta(obj: any) {
        const nvaLista: ProductoSelected[] = obj.listaProductos || [];
        const lstTemp: ProductoSelected[] = this.lstProductosSeleccionados.filter(p => +p.cuenta !== +this.cuentaActiva.numero);
        if (nvaLista.length > 0) {
            this.lstProductosSeleccionados = lstTemp.concat(nvaLista);
        } else {
            this.lstProductosSeleccionados = lstTemp;
        }
        if (obj.comanda) {
            this.mesaEnUso = obj.comanda;
            this.llenaProductosSeleccionados(this.mesaEnUso);
            this.setSelectedCuenta(+this.cuentaActiva.numero);
        }
    }

    prepProductosComanda(prods: ProductoSelected[]) {
        // console.log(prods);
        const tmp: any[] = [];
        for (const p of prods) {
            tmp.push({
                articulo: p.id,
                cantidad: p.cantidad,
                precio: p.precio,
                total: p.total,
                notas: p.notas,
                impreso: 1,
                detalle_comanda: p.detalle_comanda,
                detalle_cuenta: p.detalle_cuenta
            });
        }
        return tmp;
    }

    validarImpresion(toPdf = false, dialogRef: MatDialogRef<TranComandaAltComponent> = null) {
        const ingresarPedido = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_INGRESO_NUMERO_PEDIDO);
        // this.mesaEnUso.mesa.esmostrador;
        // console.log(this.mesaEnUso);
        if (+this.mesaEnUso.mesa.esmostrador === 1 && ingresarPedido && !this.mesaEnUso.numero_pedido) {
            let pedidos = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_TOTAL_NUMEROS_PEDIDO);
            if (!pedidos || pedidos <= 0) {
                pedidos = 30;
            }
            const confirmRef = this.dialog.open(DialogPedidoComponent, {
                maxWidth: '50%',
                data: new ConfirmDialogModel(
                    'Numero de Pedido',
                    pedidos,
                    'Sí', 'No'
                )
            });

            confirmRef.afterClosed().subscribe((conf: any) => {
                // console.log(conf);
                if (conf && conf.respuesta && conf.pedido) {
                    this.mesaEnUso.numero_pedido = conf.pedido;
                    this.printComanda(toPdf, dialogRef);
                } else {
                    this.snackBar.open('Error, Debe seleccionar un numero de pedido', 'Comanda', { duration: 7000 });
                }
            });
        } else {
            this.printComanda(toPdf, dialogRef);
        }
    }

    printComanda(toPdf = false, dialogRef: MatDialogRef<TranComandaAltComponent> = null) {
        // solicitar numero de pedido
        const meu = JSON.parse(JSON.stringify(this.mesaEnUso));

        this.bloqueoBotones = true;
        this.impreso = 0;
        const modoComanda = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_MODO_COMANDA) || 1;
        for (let i = 0; i < meu.cuentas.length; i++) {
            const cuenta = meu.cuentas[i];
            // console.log(cuenta);
            this.cuentaActiva = meu.cuentas.find((c: Cuenta) => +c.numero === +cuenta.numero);

            const lstProductosDeCuenta = this.lstProductosSeleccionados.filter(p => +p.cuenta === +this.cuentaActiva.numero);

            const lstProductosAImprimir = lstProductosDeCuenta.filter(p => +p.impreso === 0 && +p.cantidad > 0);
            if (lstProductosAImprimir.length > 0) {
                lstProductosDeCuenta.map(p => p.impreso = 1);
                this.noComanda = meu.comanda;
                // console.log(this.cuentaActiva.cuenta);
                this.cuentaActiva.productos = this.prepProductosComanda(lstProductosDeCuenta);
                const idxCta = meu.cuentas.findIndex(c => +c.cuenta === +this.cuentaActiva.cuenta);
                // console.log(meu.cuentas)
                // console.log(idxCta)
                if (idxCta > -1) {
                    // meu.cuentas[idxCta] = this.cuentaActiva;
                    const objCmd: Comanda = {
                        area: meu.mesa.area.area,
                        mesa: meu.mesa.mesa,
                        mesero: meu.usuario,
                        comanda: meu.comanda,
                        cuentas: meu.cuentas,
                        numero_pedido: meu.numero_pedido
                    };
                    // console.log('Comanda a guardar = ', objCmd);
                    this.comandaSrvc.save(objCmd).subscribe((res) => {
                        // console.log('Respuesta del save = ', res);
                        if (res.exito) {
                            meu.numero_pedido = res.comanda.numero_pedido;
                            // console.log(this.cuentaActiva);
                            this.comandaSrvc.setProductoImpreso(cuenta.cuenta).subscribe(resImp => {
                                // console.log('Respuesta de poner impreso = ', resImp);
                                if (resImp.exito) {
                                    this.impreso++;
                                }

                                this.llenaProductosSeleccionados(resImp.comanda);
                                this.setSelectedCuenta(cuenta.numero);
                                this.snackBar.open('Cuenta actualizada', `Cuenta #${cuenta.numero}`, { duration: 3000 });

                                // Inicio de impresión de comanda
                                let AImpresoraNormal: ProductoSelected[] = [];
                                let AImpresoraBT: ProductoSelected[] = [];

                                try {
                                    AImpresoraNormal = lstProductosAImprimir.filter(p => +p.impresora.bluetooth === 0);
                                    AImpresoraBT = lstProductosAImprimir.filter(p => +p.impresora.bluetooth === 1);
                                    // console.log('PRODUCTOS A IMPRIMIR = ', lstProductosAImprimir);
                                } catch (error) {
                                    console.log('PRODUCTOS A IMPRIMIR = ', lstProductosAImprimir);
                                    console.log('NORMAL = ', AImpresoraNormal);
                                    console.log('BT = ', AImpresoraBT);
                                    console.log(error);
                                }

                                if (!toPdf) {
                                    if (AImpresoraNormal.length > 0) {
                                        if (modoComanda !== 3) {
                                            if (!this.imprimeRecetaEnComanda) {
                                                AImpresoraNormal.map(d => {
                                                    if (+d.combo === 0 && +d.esreceta === 1) {
                                                        d.detalle = []
                                                    }
                                                    return d;
                                                });
                                            }
                                            this.socket.emit('print:comanda', `${JSON.stringify({
                                                Tipo: 'Comanda',
                                                Nombre: this.cuentaActiva.nombre,
                                                Numero: this.noComanda,
                                                DetalleCuenta: AImpresoraNormal,
                                                Ubicacion:
                                                    `${meu.mesa.area.nombre} - Mesa ${meu.mesa.etiqueta || meu.mesa.numero}`,
                                                Mesero: `${meu.mesero.nombres} ${meu.mesero.apellidos}`,
                                                Total: null,
                                                NumeroPedido: meu.numero_pedido,
                                                NotasGenerales: (meu.notas_generales || '')
                                            })}`);
                                            this.snackBar.open(`Imprimiendo comanda #${this.noComanda}`, 'Comanda', { duration: 7000 });
                                        } else {
                                            this.snackBar.open(
                                                `Comanda #${this.noComanda} enviada a cocina`,
                                                'Comanda',
                                                { duration: 7000 }
                                            );
                                        }
                                        this.bloqueoBotones = false;
                                        // console.log("imprimiendo")
                                    }

                                    if (AImpresoraBT.length > 0) {
                                        if (modoComanda !== 3) {
                                            if (!this.imprimeRecetaEnComanda) {
                                                AImpresoraNormal.map(d => {
                                                    if (+d.combo === 0 && +d.esreceta === 1) {
                                                        d.detalle = []
                                                    }
                                                    return d;
                                                });
                                            }
                                            this.printToBT(
                                                JSON.stringify({
                                                    Tipo: 'Comanda',
                                                    Nombre: this.cuentaActiva.nombre,
                                                    Numero: this.noComanda,
                                                    DetalleCuenta: AImpresoraBT,
                                                    Ubicacion:
                                                        `${meu.mesa.area.nombre} - Mesa ${meu.mesa.etiqueta || meu.mesa.numero}`,
                                                    Mesero: `${meu.mesero.nombres} ${meu.mesero.apellidos}`,
                                                    Total: null,
                                                    NumeroPedido: meu.numero_pedido
                                                })
                                            );
                                        }
                                    }
                                } else {
                                    this.printComandaPDF();
                                }
                                if (+this.impreso === meu.cuentas.length) {
                                    this.impreso = 0;
                                    this.socket.emit('refrescar:mesa', { mesaenuso: meu });
                                    this.socket.emit('refrescar:listaCocina', { mesaenuso: meu });
                                    if (+meu.mesa.esmostrador === 0) {
                                        if (dialogRef) {
                                            dialogRef.close();
                                        } else {
                                            this.closeSideNavEv.emit();
                                        }
                                    } else {
                                        this.cobrarCuenta(dialogRef);
                                    }
                                }
                                // Fin de impresión de comanda
                            });
                        } else {
                            this.snackBar.open(`ERROR: ${res.mensaje}`, `Cuenta #${this.cuentaActiva.numero}`, { duration: 3000 });
                        }
                        this.bloqueoBotones = false;
                    });
                }
            } else {
                this.impreso++;
                // this.snackBar.open('Nada para enviar...', `Cuenta #${this.cuentaActiva.numero}`, { duration: 3000 });
                this.bloqueoBotones = false;
            }
        }
        // console.log('Productos a imprimir = ', this.lstProductosAImprimir);

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
        this.bloqueoBotones = false;
    }

    printComandaPDF = () => {
        const noCuenta = +this.cuentaActiva.cuenta;
        this.pdfServicio.getComanda(noCuenta).subscribe(res => {
            if (res) {
                const blob = new Blob([res], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                window.open(url, `cuenta_${noCuenta}`, 'height=700,width=800,menubar=no,location=no,resizable=no,scrollbars=no,status=no');
                // this.closeSideNavEv.emit();
            } else {
                this.snackBar.open('No se pudo generar la comanda...', 'Comanda', { duration: 3000 });
            }
        });
    }

    sumaDetalle = (detalle: ProductoSelected[]) => {
        let total = 0.00;
        // for (let i = 0; i < detalle.length; i++) { total += detalle[i].total || 0.00; }
        for (const item of detalle) {
            total += +item.total || 0.00;
            total += +item.monto_extra || 0.00;
        }
        return total;
    }

    printCuenta(dialogRef: MatDialogRef<TranComandaAltComponent> = null) {
        this.bloqueoBotones = true;
        this.lstProductosAImprimir = this.lstProductosDeCuenta.filter(p => +p.impreso === 1);
        // console.log(this.lstProductosAImprimir);

        if (this.lstProductosAImprimir.length > 0) {
            this.setSumaCuenta(this.lstProductosAImprimir);
            const totalCuenta = this.sumaDetalle(this.lstProductosAImprimir);
            const printerToUse = this.mesaEnUso.mesa.impresora || this.mesaEnUso.mesa.area.impresora;
            const imprimePropSugerida = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_IMPRIME_PROPINA_SUGERIDA);

            const msgToPrint = {
                Tipo: 'Cuenta',
                Nombre: this.cuentaActiva.nombre,
                Numero: null,
                DetalleCuenta: this.lstProductosAImprimir,
                Total: totalCuenta,
                Empresa: this.ls.get(GLOBAL.usrTokenVar).empresa,
                Restaurante: this.ls.get(GLOBAL.usrTokenVar).restaurante,
                PropinaSugerida: imprimePropSugerida ? (totalCuenta * 0.10).toFixed(2) : null,
                Impresora: printerToUse,
                Ubicacion:
                    `${this.mesaEnUso.mesa.area.nombre} - Mesa ${this.mesaEnUso.mesa.etiqueta || this.mesaEnUso.mesa.numero
                    } - Comanda ${this.mesaEnUso.comanda}`,
                Mesero: `${this.mesaEnUso.mesero.nombres} ${this.mesaEnUso.mesero.apellidos}`
            };

            if (+printerToUse.bluetooth === 0) {
                this.socket.emit(`print:cuenta`, `${JSON.stringify(msgToPrint)}`);
            } else {
                this.printToBT(JSON.stringify(msgToPrint));
            }
            this.snackBar.open(`Imprimiendo cuenta de ${this.cuentaActiva.nombre}`, 'Cuenta', { duration: 7000 });            
            if (dialogRef) {
                dialogRef.close();
            } else {
                this.closeSideNavEv.emit();
            }
        } else {
            this.snackBar.open(`La cuenta de ${this.cuentaActiva.nombre} no tiene ningún artículo.`, 'Cuenta', { duration: 7000 });
        }
        this.bloqueoBotones = false;
    }

    unirCuentas(dialogRef: MatDialogRef<TranComandaAltComponent> = null) {
        const unirCuentaRef = this.dialog.open(UnirCuentaComponent, {
            width: '55%',
            data: { lstProductosSeleccionados: this.lstProductosSeleccionados, mesaEnUso: this.mesaEnUso }
        });

        unirCuentaRef.afterClosed().subscribe(result => {
            if (result) {
                if (dialogRef) {
                    dialogRef.close();
                } else {
                    this.closeSideNavEv.emit();
                }
            }
        });
    }

    cobrarCuenta(dialogRef: MatDialogRef<TranComandaAltComponent> = null) {
        this.comandaSrvc.getCuenta(this.cuentaActiva.cuenta).subscribe(res => {
            if (res.pendiente.length > 0) {
                this.snackBar.open('Cobro', 'Tiene productos sin comandar', { duration: 3000 });
            } else {
                const productosACobrar = this.lstProductosDeCuenta.filter(p => +p.impreso === 1);
                if (productosACobrar.length > 0) {
                    const cobrarCtaRef = this.dialog.open(CobrarPedidoComponent, {
                        width: '95%',
                        data: {
                            mesaenuso: this.mesaEnUso,
                            cuenta: this.cuentaActiva.nombre,
                            idcuenta: this.cuentaActiva.cuenta,
                            productosACobrar,
                            porcentajePropina: 0.00,
                            impresora: +this.mesaEnUso.mesa.esmostrador === 0 ?
                                (this.mesaEnUso.mesa.area.impresora_factura || null) :
                                (this.mesaEnUso.mesa.impresora || this.mesaEnUso.mesa.area.impresora),
                            clientePedido: this.clientePedido
                        }
                    });

                    cobrarCtaRef.afterClosed().subscribe(resAC => {
                        // console.log(resAC);
                        if (resAC && resAC !== 'closePanel') {
                            // console.log(res);
                            this.cambiarEstatusCuenta(resAC);
                            if (dialogRef) {
                                dialogRef.close(this.mesaEnUso);
                            } else {
                                this.closeSideNavEv.emit(this.mesaEnUso);
                            }
                        } else {
                            if (resAC === 'closePanel') {
                                if (dialogRef) {
                                    dialogRef.close(this.mesaEnUso);
                                } else {
                                    this.closeSideNavEv.emit();
                                }
                            }
                        }
                    });
                } else {
                    this.snackBar.open('Cobro', 'Sin productos a cobrar.', { duration: 3000 });
                }
            }
        });
    }

    enviarPedido = (dialogRef: MatDialogRef<TranComandaAltComponent> = null) => {
        const cuenta = this.mesaEnUso.cuentas[0];
        this.cuentaActiva = this.mesaEnUso.cuentas.find((c: Cuenta) => +c.numero === +cuenta.numero);
        const lstProductosDeCuenta = this.lstProductosSeleccionados.filter(p => +p.cuenta === +this.cuentaActiva.numero);
        lstProductosDeCuenta.map(p => p.impreso = 1);
        this.noComanda = this.mesaEnUso.comanda;
        this.cuentaActiva.productos = this.prepProductosComanda(lstProductosDeCuenta);
        const idxCta = this.mesaEnUso.cuentas.findIndex(c => +c.cuenta === +this.cuentaActiva.cuenta);
        if (idxCta > -1) {
            const objCmd: Comanda = {
                area: this.mesaEnUso.mesa.area.area,
                mesa: this.mesaEnUso.mesa.mesa,
                mesero: this.mesaEnUso.usuario,
                comanda: this.mesaEnUso.comanda,
                cuentas: this.mesaEnUso.cuentas,
                numero_pedido: this.mesaEnUso.numero_pedido
            };

            this.comandaSrvc.save(objCmd).subscribe((res) => {
                if (res.exito) {
                    this.mesaEnUso.numero_pedido = res.comanda.numero_pedido;
                    this.comandaSrvc.setProductoImpreso(cuenta.cuenta).subscribe(resImp => {
                        this.llenaProductosSeleccionados(resImp.comanda);
                        this.setSelectedCuenta(cuenta.numero);
                        this.cobrarCuenta(dialogRef);
                    });
                }
            });
        }
    }

    cambiarEstatusCuenta = (obj: any) => {
        const idxCta = this.mesaEnUso.cuentas.findIndex(c => +c.cuenta === +obj.cuenta);
        this.mesaEnUso.cuentas[idxCta].cerrada = +obj.cerrada;
    }

    // esCajero = () => (this.rolesUsuario || []).find(r => r.trim().toLocaleLowerCase() === 'cajero') === undefined;
    esCajero = () => false;

    trasladoMesa = (dialogRef: MatDialogRef<TranComandaAltComponent> = null) => {
        const trasladoRef = this.dialog.open(TrasladoMesaComponent, {
            width: '55%',
            data: { mesaEnUso: this.mesaEnUso }
        });

        trasladoRef.afterClosed().subscribe(result => {
            if (result) {
                this.socket.emit('refrescar:mesa', { mesaenuso: this.mesaEnUso });
                if (dialogRef) {
                    dialogRef.close(this.mesaEnUso);
                } else {
                    this.closeSideNavEv.emit(this.mesaEnUso);
                }
            }
        });
    }

    getNotasGenerales = () => {
        const ngenDialog = this.dialog.open(NotasGeneralesComandaComponent, {
            width: '50%',
            data: { notasGenerales: (this.mesaEnUso.notas_generales || '') }
        });
        ngenDialog.afterClosed().subscribe((notasGen: string) => {
            if (notasGen !== null) {
                if (notasGen.trim().length > 0) {
                    this.comandaSrvc.saveNotasGenerales({ comanda: this.mesaEnUso.comanda, notas_generales: notasGen }).subscribe(res => {
                        if (res.exito) {
                            this.mesaEnUso.notas_generales = notasGen;
                            this.snackBar.open(res.mensaje, 'Comanda', { duration: 3000 });
                        } else {
                            this.snackBar.open(`ERROR: ${res.mensaje}`, 'Comanda', { duration: 7000 });
                        }
                    });
                }
            }
        });
    }

    nuevaCuenta = (dialogRef: MatDialogRef<TranComandaAltComponent> = null) => {
        const nuevaCuentaRef = this.dialog.open(NuevaCuentaComponent, {
            width: '50%',
            data: { mesaEnUso: this.mesaEnUso }
        });

        nuevaCuentaRef.afterClosed().subscribe(result => {
            if (result) {
                if (dialogRef) {
                    dialogRef.close();
                } else {
                    this.closeSideNavEv.emit();
                }
            }
        });
    }

    distribuirProductos = (dialogRef: MatDialogRef<TranComandaAltComponent> = null) => {
        const distProdCtaRef = this.dialog.open(DistribuirProductosCuentasComponent, {
            width: '50%',
            data: { mesaEnUso: this.mesaEnUso, lstProductos: (this.lstProductosSeleccionados || []) }
        });

        distProdCtaRef.afterClosed().subscribe(result => {
            if (result) {
                if (dialogRef) {
                    dialogRef.close();
                } else {
                    this.closeSideNavEv.emit();
                }
            }
        });
    }

    abrirAccionesComanda = (dialogRef: MatDialogRef<TranComandaAltComponent>) => {
        const bs = this.bsAccionesCmd.open(AccionesComandaComponent, {
            autoFocus: false,
            data: {
                tranComanda: this,
                dialogRef
            }
        });

        bs.afterDismissed().subscribe((result: any) => {
            if (result?.cerrar) {
                dialogRef.close(result.mesaEnUso || null);
            }
        });
    }

}

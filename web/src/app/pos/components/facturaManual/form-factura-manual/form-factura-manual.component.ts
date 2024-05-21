import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { GLOBAL, isNotNullOrUndefined, redondear, seleccionaDocumentoReceptor } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { Socket } from 'ngx-socket-io';
import { Base64 } from 'js-base64';
import * as moment from 'moment';

import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { DresultadoListaComponent } from '@pos-components/facturaManual/dresultado-lista/dresultado-lista.component';
import { Factura } from '@pos-interfaces/factura';
import { DetalleFactura } from '@pos-interfaces/detalle-factura';
import { FacturaService } from '@pos-services/factura.service';
import { RazonAnulacion } from '@admin-interfaces/razon-anulacion';
import { AnulacionService } from '@admin-services/anulacion.service';

import { FacturaSerie } from '@pos-interfaces/factura-serie';
import { FacturaSerieService } from '@pos-services/factura-serie.service';
import { Cliente } from '@admin-interfaces/cliente';
import { ClienteService } from '@admin-services/cliente.service';
import { Moneda } from '@admin-interfaces/moneda';
import { MonedaService } from '@admin-services/moneda.service';
import { Articulo } from '@wms-interfaces/articulo';
import { ArticuloService } from '@wms-services/articulo.service';

import { Impresora } from '@admin-interfaces/impresora';
import { ImpresoraService } from '@admin-services/impresora.service';
import { ConfiguracionService } from '@admin-services/configuracion.service';
import { Impresion } from '@restaurante-classes/impresion';

import { Municipio } from '@admin-interfaces/municipio';
import { MunicipioService } from '@admin-services/municipio.service';

import { Abono } from '@hotel/interfaces/abono';

import { Subscription } from 'rxjs';
import { FormClienteDialogComponent } from '@admin/components/cliente/form-cliente-dialog/form-cliente-dialog.component';

@Component({
  selector: 'app-form-factura-manual',
  templateUrl: './form-factura-manual.component.html',
  styleUrls: ['./form-factura-manual.component.css']
})
export class FormFacturaManualComponent implements OnInit, OnDestroy {

  get totalDeFactura(): number {
    let totFact = 0;
    for (const df of this.detallesFactura) {
      totFact += +df.total + (+df.valor_impuesto_especial > 0 ? +df.valor_impuesto_especial : 0);
    }
    return totFact;
  }

  get desHabilitaCliente() {
    return (c: Cliente): boolean => {
      let deshabilitar = false;
      if (+this.totalDeFactura >= 2500 || +this.totalFacturaOriginal >= 2500) {
        const documento = seleccionaDocumentoReceptor(c, this.municipios);        
        deshabilitar = documento?.documento && documento?.tipo && documento.documento !== 'CF' ? false : true;
      }
      return deshabilitar;
    }
  }

  get nuevoCliente(): Cliente {
    const nvoCli: Cliente = {
      cliente: null, nombre: null, direccion: null, nit: null, cui: null, pasaporte: null, telefono: null, correo: null,
      codigo_postal: null, municipio: null, departamento: null, pais_iso_dos: null, observaciones: null, tipo_cliente: null
    };
    return nvoCli;
  }

  get noPuedeFirmar() {
    if (this.abono?.abono) {
      if (+this.totalDeFactura !== +this.abono.monto) {
        return true;
      }
    }
    const idCliente: number = +this.clienteOriginal?.cliente || +this.factura?.cliente || 0;
    if (idCliente > 0) {
      const cli = this.clientes.find(c => +c.cliente === idCliente);
      if (cli) {
        return this.desHabilitaCliente(cli);
      }
    }
    return false;
  }

  @Input() factura: Factura;
  @Input() abono: Abono;
  @Output() facturaSavedEv = new EventEmitter();
  @Output() getClienteEv = new EventEmitter();

  public showForm = true;
  public showFormDetalle = true;
  public facturaSeries: FacturaSerie[] = [];
  public clientes: Cliente[] = [];
  public filteredClientes: Cliente[] = [];
  public monedas: Moneda[] = [];
  public detallesFactura: DetalleFactura[] = [];
  public detalleFactura: DetalleFactura;
  public articulos: Articulo[] = [];
  public filteredArticulos: Articulo[] = [];
  public displayedColumns: string[] = ['articulo', 'cantidad', 'precio_unitario', 'descuento', 'valor_impuesto_especial', 'total', 'editItem'];
  public dataSource: MatTableDataSource<DetalleFactura>;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public refacturacion = false;
  public txtArticuloSelected: (Articulo | string) = undefined;
  public clienteSelected: (Cliente | string) = undefined;
  public razonAnulacion: RazonAnulacion[] = [];
  public impresoraPorDefecto: Impresora = null;
  public municipios: Municipio[] = [];
  public height: string;
  public heightArticulos: string;
  public cargando = false;
  public clienteOriginal: Cliente = null;
  public totalFacturaOriginal: number = 0;
  public permiteDetalleFacturaPersonalizado = true;
  public lstClientes: Cliente[];
  public mostrarBotonNuevo: boolean = false;

  private readonly WIN_FEATURES = 'height=700,width=800,menubar=no,location=no,resizable=no,scrollbars=no,status=no';

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private facturaSrvc: FacturaService,
    private facturaSerieSrvc: FacturaSerieService,
    private clienteSrvc: ClienteService,
    private monedaSrvc: MonedaService,
    private articuloSrvc: ArticuloService,
    private anulacionSrvc: AnulacionService,
    private socket: Socket,
    private ls: LocalstorageService,
    private configSrvc: ConfiguracionService,
    private impresoraSrvc: ImpresoraService,
    private mupioSrvc: MunicipioService,    
    public dialogAddCliente: MatDialog
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.permiteDetalleFacturaPersonalizado = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_PERMITE_DETALLE_FACTURA_PERSONALIZADO) as boolean;
    this.refacturacion = false;
    this.resetFactura();
    this.loadFacturaSeries();
    this.loadMunicipios();
    this.loadClientes();
    this.loadMonedas();
    this.loadArticulos();
    this.getRazonAnulacion();
    this.loadImpresoraDefecto();
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);
      this.socket.on('reconnect', () => this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid));
    }

    if (this.abono?.abono) {
      // console.log('ABONO = ', this.abono);
      this.loadFactura();
    }    
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  getRazonAnulacion = () => {
    this.cargando = true;
    this.endSubs.add(
      this.anulacionSrvc.get().subscribe(res => {
        this.razonAnulacion = res;
        this.cargando = false;
      })
    );
  }

  filtrar = (value: (Cliente | string)) => {
    if (value !== null && value !== undefined && (typeof value === 'string')) {
      const filterValue = value.toLowerCase();
      this.filteredClientes = this.clientes.filter(c => c.nombre?.toLowerCase().includes(filterValue) || c.nit?.toLowerCase().includes(filterValue) || c.cui?.toLowerCase().includes(filterValue) || c.pasaporte?.toLowerCase().includes(filterValue));
    } else {
      this.filteredClientes = JSON.parse(JSON.stringify(this.clientes));
    }

    if (this.filteredClientes.length === 0) {
      this.mostrarBotonNuevo = true;
    } else {
      this.mostrarBotonNuevo = false;
    }

    if (this.filteredClientes.length < 7) {
      this.height = (this.filteredClientes.length * 50) + 'px';
    } else {
      this.height = '350px';
    }
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

  loadFacturaSeries = () => {
    this.cargando = true;
    this.endSubs.add(
      this.facturaSerieSrvc.get().subscribe(res => {
        this.facturaSeries = res;        
        this.cargando = false;
      })
    );
  }

  loadClientes = () => {
    this.cargando = true;
    this.endSubs.add(
      this.clienteSrvc.get().subscribe(res => {
        this.clientes = res;
        this.filteredClientes = JSON.parse(JSON.stringify(this.clientes));        
        this.cargando = false;
      })
    );
  }

  getCliente = (obj: Cliente) => this.getClienteEv.emit(obj);

  agregarCliente = (cli: Cliente = this.nuevoCliente, idx: number = 0) => {
    const addClienteRef = this.dialogAddCliente.open(FormClienteDialogComponent, {
      width: '75%',
      data: { esDialogo: true, cliente: JSON.parse(JSON.stringify(cli)) }
    });

    this.endSubs.add(
      addClienteRef.afterClosed().subscribe(result => {
        if (result) {
          if (!(+idx > 0) && this.clienteSrvc.lstClientes.length > 0) {
            const indice = this.clienteSrvc.lstClientes.findIndex(c => +c.cliente === +(result as Cliente).cliente);
            if (indice > 0) {
              this.clienteSrvc.lstClientes[indice] = {...(result as Cliente)};
            } else {
              this.clienteSrvc.lstClientes.push(result as Cliente);
            }
          }
          this.loadClientes();
          this.getCliente(result);                             
          this.clienteSelected = (result as Cliente);
        }
      })
    );
  }

  loadMunicipios = () => {
    this.cargando = true;
    this.endSubs.add(this.mupioSrvc.get().subscribe(res => {
      this.municipios = res;
      this.cargando = false;
    }));
  };

  loadMonedas = () => {
    this.cargando = true;
    this.endSubs.add(
      this.monedaSrvc.get().subscribe(res => {
        this.monedas = res;        
        this.cargando = true;
      })
    );
  }

  refacturar = () => {
    this.cargando = true;
    this.totalFacturaOriginal = this.totalDeFactura;
    this.factura = {
      factura: this.factura.factura, factura_serie: null, cliente: null,
      fecha_factura: moment().format(GLOBAL.dbDateFormat), moneda: null, exenta: 0, notas: null,
      fel_uuid: null, fel_uuid_anulacion: null
    };
    this.refacturacion = true;
    this.clienteSelected = undefined;
    this.resetDetalleFactura();
    this.detallesFactura = [];
    this.cargando = false;
  }

  resetFactura = () => {
    this.factura = {
      factura: null, factura_serie: null, cliente: null,
      fecha_factura: moment().format(GLOBAL.dbDateFormat), moneda: null, exenta: 0, notas: null,
      fel_uuid: null, fel_uuid_anulacion: null, enviar_descripcion_unica: 0, descripcion_unica: null
    };
    this.clienteSelected = undefined;
    this.resetDetalleFactura();
    this.detallesFactura = [];
    this.totalFacturaOriginal = 0;
    this.clienteOriginal = null;
    this.refacturacion = false;
  }

  displayCliente = (cli: Cliente) => {
    if (cli) {
      this.factura.cliente = cli.cliente;
      return cli.nombre + `(${cli.nit || cli.cui || cli.pasaporte || ''})`;
    }
    return undefined;
  }

  onSubmit = () => {
    this.cargando = true;
    // console.log(this.factura); return;    
    this.factura.abono = this.abono?.abono || null;
    if (this.refacturacion) {
      this.endSubs.add(
        this.facturaSrvc.refacturar(this.factura).subscribe(res => {
          if (res.exito) {
            this.facturaSavedEv.emit();
            this.resetFactura();
            this.refacturacion = false;
            this.factura = {
              factura: res.factura.factura,
              factura_serie: res.factura.factura_serie,
              cliente: res.factura.cliente,
              fecha_factura: res.factura.fecha_factura,
              moneda: res.factura.moneda,
              exenta: +res.factura.exenta,
              notas: res.factura.notas,
              usuario: res.factura.usuario,
              numero_factura: res.factura.numero_factura,
              serie_factura: res.factura.serie_factura,
              fel_uuid: res.factura.fel_uuid,
              fel_uuid_anulacion: res.factura.fel_uuid_anulacion,              
              enviar_descripcion_unica: +res.factura.enviar_descripcion_unica,
              descripcion_unica: res.factura.descripcion_unica
            };
            const cli = this.clientes.find(c => +c.cliente === +this.factura.cliente);
            if (isNotNullOrUndefined(cli)) {
              this.clienteSelected = cli;
              this.clienteOriginal = { ...cli };
            }
            this.totalFacturaOriginal = 0;
            this.loadDetalleFactura(+this.factura.factura);
            this.snackBar.open('Factura manual agregada...', 'Factura', { duration: 3000 });
          }
          this.cargando = false;
        })
      );
    } else {
      this.endSubs.add(        
        this.facturaSrvc.save(this.factura).subscribe(res => {
          if (res.exito) {
            this.facturaSavedEv.emit();
            this.resetFactura();
            this.factura = {
              factura: res.factura.factura,
              factura_serie: res.factura.factura_serie,
              cliente: res.factura.cliente,
              fecha_factura: res.factura.fecha_factura,
              moneda: res.factura.moneda,
              exenta: +res.factura.exenta,
              notas: res.factura.notas,
              fel_uuid: res.factura.fel_uuid,
              enviar_descripcion_unica: +res.factura.enviar_descripcion_unica,
              descripcion_unica: res.factura.descripcion_unica
            }           

            const cli = this.clientes.find(c => +c.cliente === +this.factura.cliente);
            if (isNotNullOrUndefined(cli)) {
              this.clienteSelected = cli;
              this.clienteOriginal = { ...cli };
            }            
            this.loadDetalleFactura(+this.factura.factura);            
            this.snackBar.open('Factura manual agregada...', 'Factura', { duration: 3000 });
          }
          this.cargando = false;
        })
      );
    }

  }

  firmarFactura = () => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Firmar factura',
        'Luego de firmar la factura no podrá hacer ninguna modificación. ¿Desea continuar?',
        'Sí', 'No'
      )
    });

    this.endSubs.add(      
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.cargando = true;
          this.endSubs.add(
            this.facturaSrvc.firmar(+this.factura.factura).subscribe(resFirma => {
              if (resFirma.exito) {
                this.factura.numero_factura = resFirma.factura.numero_factura;
                this.factura.serie_factura = resFirma.factura.serie_factura;
                this.factura.certificador_fel = resFirma.factura.certificador_fel;
                this.factura.fel_uuid = resFirma.factura.fel_uuid;
                this.facturaSavedEv.emit();
                this.snackBar.open('Factura firmada con éxito...', 'Firmar', { duration: 3000 });
              } else {
                this.snackBar.open(`ERROR: ${resFirma.mensaje}`, 'Firmar', { duration: 3000 });
              }
              this.cargando = false;
            })
          );
        }
      })
    );
  }

  procesaDetalleFactura = (detalle: any[], edu = 0, descripcionUnica: string = null) => {
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
        Total: +d.total,
        TotalSinDescuento: redondear(+d.total + +d.descuento),
        PrecioUnitario: +d.precio_unitario,
        PrecioUnitarioSinDescuento: redondear(+d.precio_unitario)
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

  getTotalDescuento = (detalle: any[]): number => {
    let suma = 0.00;
    detalle.forEach(d => suma += +d.descuento);
    return suma;
  }

  imprimirFactura = () => {
    // console.log(this.factura);
    this.cargando = true;
    this.facturaSrvc.imprimir(+this.factura.factura).subscribe(res => {
      if (res.factura) {
        // console.log(res.factura);
        const totalDeDescuento = this.getTotalDescuento(res.factura.detalle);
        const datosAImprimir = {
          IdFactura: +res.factura.factura,
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
          Impresora: this.impresoraPorDefecto,
          ImpuestosAdicionales: (res.factura.impuestos_adicionales || []),
          EsReimpresion: true,
          Comanda: res.factura.comanda || 0,
          Cuenta: res.factura.cuenta || 0,
          DatosComanda: res.factura.datos_comanda || null,
          TotalDescuento: redondear(totalDeDescuento)
        };

        datosAImprimir.TotalSinDescuento = redondear(+datosAImprimir.Total + totalDeDescuento);

        // console.log(datosAImprimir);

        if (this.impresoraPorDefecto) {
          if (+this.impresoraPorDefecto.bluetooth === 0) {
            this.socket.emit(`print:factura`, `${JSON.stringify(datosAImprimir)}`);
          } else {
            this.printToBT(JSON.stringify(datosAImprimir));
          }
        } else {
          delete datosAImprimir.Impresora;
          this.socket.emit(`print:factura`, `${JSON.stringify(datosAImprimir)}`);
        }

        this.snackBar.open(
          `Imprimiendo factura ${this.factura.serie_factura}-${this.factura.numero_factura}`,
          'Impresión', { duration: 3000 }
        );
      } else {
        this.snackBar.open(`ERROR: ${res.mensaje}`, 'Impresión', { duration: 3000 });
      }
      this.cargando = false;
    });
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

  anularFactura = () => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Anular factura',
        'Luego de anular la factura no podrá hacer ninguna modificación. ¿Desea continuar?',
        'Sí',
        'No',
        {
          input: [
            {
              select: true,
              label: 'Motivo',
              datos: this.razonAnulacion,
              valor: null,
              id: 'razon_anulacion',
              descripcion: 'descripcion',
              requerido: true
            },
            {
              select: false,
              label: 'Comentario',
              valor: null,
              id: 'comentario_anulacion',
              requerido: false
            }
          ]
        }
      )
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(res => {
        if (res.resultado) {
          this.cargando = true;
          const params = {};
          for (let i = 0; i < res.config.input.length; i++) {
            const input = res.config.input[i];
            params[input.id] = input.valor;
          }
          
          this.endSubs.add(            
            this.facturaSrvc.anular(+this.factura.factura, params).subscribe(resAnula => {
              if (resAnula.exito) {
                this.factura.fel_uuid_anulacion = resAnula.factura.fel_uuid_anulacion;
                this.imprimirCodoAnulacion(this.factura, resAnula.anulacion);
                this.facturaSavedEv.emit();
                this.snackBar.open('Factura anulada con éxito...', 'Firmar', { duration: 3000 });
              } else {
                this.snackBar.open(`ERROR: ${resAnula.mensaje}`, 'Firmar', { duration: 10000 });
              }
              this.cargando = false;
            })
          );
        }
      })
    );
  }

  getResultadoFel(fact: any) {
    this.dialog.open(DresultadoListaComponent, {
      data: fact, width: '70%'
    });
  }

  loadArticulos = () => {
    this.cargando = true;
    this.endSubs.add(      
      this.articuloSrvc.getArticulos().subscribe(res => {
        this.articulos = res;
        this.filteredArticulos = this.articulos;
        this.cargando = false;
      })
    );
  }

  displayArticulo = (art: Articulo) => {
    if (art) {
      this.detalleFactura.articulo = art.articulo;
      return art.descripcion;
    }
    return undefined;
  }

  filtrarArticulos = (value: (Articulo | string)) => {
    if (value && (typeof value === 'string')) {
      const filterValue = value.toLowerCase();
      this.filteredArticulos = this.articulos.filter(a => a.descripcion.toLowerCase().includes(filterValue));
    } else {
      this.filteredArticulos = this.articulos;
    }

    if (this.filteredArticulos.length < 7) {
      this.heightArticulos = (this.filteredArticulos.length * 50) + 'px';
    } else {
      this.heightArticulos = '350px'
    }
  }

  setPrecioUnitario = (ev: MatAutocompleteSelectedEvent) => {
    const obj: Articulo = ev.option.value;
    this.detalleFactura.precio_unitario = +obj.precio;
    this.detalleFactura.total = +this.detalleFactura.precio_unitario * +this.detalleFactura.cantidad;
  }

  resetDetalleFactura = () => {
    this.detalleFactura = {
      detalle_factura: null, factura: (this.factura.factura || 0), articulo: null, cantidad: 1, precio_unitario: null, total: null, cantidad_inventario: 1
    };
    this.txtArticuloSelected = undefined;
  }

  loadDetalleFactura = (idfactura: number = +this.factura.factura) => {
    this.cargando = true;
    this.endSubs.add(      
      this.facturaSrvc.getDetalle(idfactura, { factura: idfactura }).subscribe(res => {
        // console.log(res);
        if (res) {
          this.detallesFactura = res;
          this.updateTableDataSource();
        }
        this.cargando = false;
      })
    );
  }

  getDetalleFactura = (idfactura: number = +this.factura.factura, iddetalle: number) => {
    this.cargando = true;
    this.endSubs.add(      
      this.facturaSrvc.getDetalle(idfactura, { detalle_factura: iddetalle }).subscribe((res: any[]) => {
        // console.log(res);
        if (res) {
          this.detalleFactura = {
            detalle_factura: res[0].detalle_factura,
            factura: res[0].factura,
            articulo: res[0].articulo.articulo,
            cantidad: +res[0].cantidad,
            precio_unitario: +res[0].precio_unitario,
            total: +res[0].total,
            cantidad_inventario: +res[0].cantidad_inventario
          };
          this.txtArticuloSelected = res[0].articulo;
          this.showFormDetalle = true;
        }
        this.cargando = false;
      })
    );
  }

  onSubmitDetail = () => {    
    if (this.detalleFactura.articulo == null) {
      this.snackBar.open(`ERROR: Artículo no válido. Por favor seleccione un artículo válido.`, 'Artículo', { duration: 7000 });
      return;
    }
    this.cargando = true;
    this.detalleFactura.factura = this.factura.factura;
    this.detalleFactura.total = +this.detalleFactura.precio_unitario * +this.detalleFactura.cantidad;
    this.detalleFactura.cantidad_inventario = +this.detalleFactura.cantidad;
    // console.log(this.detalleFactura);
    this.endSubs.add(
      this.facturaSrvc.saveDetalle(this.detalleFactura).subscribe(res => {
        // console.log(res);
        if (res) {
          this.loadDetalleFactura();
          this.resetDetalleFactura();
        }
        this.cargando = false;
      })
    );
  }

  updateTableDataSource = () => this.dataSource = new MatTableDataSource(this.detallesFactura);

  representacionGrafica = () => {
    this.cargando = true;
    this.endSubs.add(
      this.facturaSrvc.getGrafo(this.factura.factura).subscribe(res => {
        if (res.exito) {
          switch (res.tipo) {
            case 'link': this.openLinkWindow(res.documento); break;
            case 'pdf': this.openPdfDocument(res.documento); break;
            case 'xml': this.openXMLDocument(res.documento); break;
          }
        }
        this.cargando = false;
      })
    );
  }

  openLinkWindow = (url: string) => window.open(url, 'winFactPdf', this.WIN_FEATURES);

  openPdfDocument = (pdf: string) => {
    const pdfWindow = window.open('', 'winFactPdf', this.WIN_FEATURES);
    try {
      pdfWindow.document.write(
        '<iframe width="100%" style="margin: -8px;border: none;" height="100%" src="data:application/pdf;base64, ' +
        encodeURI(pdf) +
        '"></iframe>');
    } catch (e) {
      this.snackBar.open('No se pudo abrir la ventana emergente para ver la representación gráfica. Revise la configuración de su explorador, por favor.', 'PDF', { duration: 7000 });
    }
  }

  openXMLDocument = (xml: string) => {
    const xmlWindow = window.open('', 'winFactXML', this.WIN_FEATURES);
    try {
      xmlWindow.document.write(`<pre lang="xml">${xml}</pre>`);
    } catch (e) {
      this.snackBar.open('No se pudo abrir la ventana emergente para ver la representación gráfica. Revise la configuración de su explorador, por favor.', 'PDF', { duration: 7000 });
    }
  }

  vaciaDescripcionUnica = () => {
    if (+this.factura.enviar_descripcion_unica === 0) {
      this.factura.descripcion_unica = null;
    } else {
      this.factura.descripcion_unica = (this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_DETALLE_FACTURA_PERSONALIZADO) as string) || 'Por consumo.';
    }
  }

  imprimirCodoAnulacion = (fact: Factura, anulacion: any) => {
    const objImpresion = new Impresion(this.socket);
    objImpresion.impresoraPorDefecto = this.impresoraPorDefecto;
    objImpresion.anulacionDeFactura(fact, anulacion);
  }

  loadFactura = () => {
    const fltr: any = { _todas: 1 };

    if (this.abono?.abono) {
      fltr.abono = +this.abono.abono;
    }

    if (this.factura?.factura) {
      fltr.factura = +this.factura.factura;
    }

    this.cargando = true;
    this.endSubs.add(
      this.facturaSrvc.get(fltr).subscribe(res => {
        if (res && res.length > 0) {
          const fact: any = res[0];
          this.factura = {
            factura: fact.factura,
            factura_serie: fact.factura_serie.factura_serie,
            cliente: fact.cliente.cliente,
            fecha_factura: fact.fecha_factura,
            moneda: fact.moneda.moneda,
            exenta: fact.exenta,
            notas: fact.notas,
            usuario: fact.usuario.usuario,
            numero_factura: fact.numero_factura,
            serie_factura: fact.serie_factura,
            fel_uuid: fact.fel_uuid,
            fel_uuid_anulacion: fact.fel_uuid_anulacion,
            certificador_fel: fact.certificador_fel,
            enviar_descripcion_unica: fact.enviar_descripcion_unica,
            descripcion_unica: fact.descripcion_unica,
            abono: fact.abono
          };
          this.clienteSelected = fact.cliente;
          this.clienteOriginal = JSON.parse(JSON.stringify(fact.cliente));
          this.loadDetalleFactura(+this.factura.factura);
          this.resetDetalleFactura();
        }
        this.cargando = false;
      })
    );
  }
}

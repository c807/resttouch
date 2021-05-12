import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../../shared/global';
import * as moment from 'moment';

import { Ingreso } from '../../../interfaces/ingreso';
import { DetalleIngreso } from '../../../interfaces/detalle-ingreso';
import { Documento } from '../../../interfaces/documento';
import { IngresoService } from '../../../services/ingreso.service';
import { TipoMovimiento } from '../../../interfaces/tipo-movimiento';
import { TipoMovimientoService } from '../../../services/tipo-movimiento.service';
import { Proveedor } from '../../../interfaces/proveedor';
import { ProveedorService } from '../../../services/proveedor.service';
import { Bodega } from '../../../interfaces/bodega';
import { BodegaService } from '../../../services/bodega.service';
import { Articulo } from '../../../interfaces/articulo';
import { ArticuloService } from '../../../services/articulo.service';
import { Presentacion } from '../../../../admin/interfaces/presentacion';
import { PresentacionService } from '../../../../admin/services/presentacion.service';
import { DocumentoTipo } from '../../../../admin/interfaces/documento-tipo';
import { DocumentoTipoService } from '../../../../admin/services/documento-tipo.service';
import { TipoCompraVenta } from '../../../../admin/interfaces/tipo-compra-venta';
import { TipoCompraVentaService } from '../../../../admin/services/tipo-compra-venta.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-form-ingreso',
  templateUrl: './form-ingreso.component.html',
  styleUrls: ['./form-ingreso.component.css']
})
export class FormIngresoComponent implements OnInit {

  @Input() ingreso: Ingreso;
  @Input() saveToDB = true;
  @Output() ingresoSavedEv = new EventEmitter();

  public showIngresoForm = true;
  public showDetalleIngresoForm = true;
  public showDocumentoForm = true;

  public detallesIngreso: DetalleIngreso[] = [];
  public detalleIngreso: DetalleIngreso;
  public displayedColumns: string[] = ['articulo', 'presentacion', 'cantidad', 'costo_unitario', 'costo_total', 'deleteItem'];
  public dataSource: MatTableDataSource<DetalleIngreso>;
  public tiposMovimiento: TipoMovimiento[] = [];
  public proveedores: Proveedor[] = [];
  public filteredProveedores: Proveedor[] = [];
  public bodegas: Bodega[] = [];
  public articulos: Articulo[] = [];
  public filteredArticulos: Articulo[] = [];
  public presentaciones: Presentacion[] = [];
  public fltrPresentaciones: Presentacion[] = [];
  public esMovil = false;
  public bloqueoBotones = false;
  public txtArticuloSelected: (Articulo | string) = undefined;
  public txtProveedorSelected: (Proveedor | string) = undefined;
  public documento: Documento;
  public documentosTipo: DocumentoTipo[] = [];
  public tiposCompraVenta: TipoCompraVenta[] = [];

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private ingresoSrvc: IngresoService,
    private proveedorSrvc: ProveedorService,
    private tipoMovimientoSrvc: TipoMovimientoService,
    private bodegaSrvc: BodegaService,
    private articuloSrvc: ArticuloService,
    private presentacinSrvc: PresentacionService,
    private documentoTipoSrvc: DocumentoTipoService,
    private tipoCompraVentaSrvc: TipoCompraVentaService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetIngreso();
    this.loadTiposMovimiento();
    this.loadProveedores();
    this.loadBodegas();
    this.loadArticulos();
    this.loadPresentaciones();
    this.loadDocumentosTipo();
    this.loadTiposCompraVenta();
  }

  loadTiposMovimiento = () => {
    this.tipoMovimientoSrvc.get({ ingreso: 1 }).subscribe(res => {
      if (res) {
        this.tiposMovimiento = res;
      }
    });
  }

  loadProveedores = () => {
    this.proveedorSrvc.get().subscribe(res => {
      if (res) {
        this.proveedores = res;
      }
    });
  }

  loadBodegas = () => {
    this.bodegaSrvc.get({ sede: (+this.ls.get(GLOBAL.usrTokenVar).sede || 0) }).subscribe(res => {
      if (res) {
        this.bodegas = res;
      }
    });
  }

  loadPresentaciones = () => {
    this.presentacinSrvc.get().subscribe(res => {
      if (res) {
        this.presentaciones = res;
      }
    });
  }

  loadDocumentosTipo = () => {
    this.documentoTipoSrvc.get().subscribe(res => {
      if (res) {
        this.documentosTipo = res;
      }
    });
  }

  loadTiposCompraVenta = () => {
    this.tipoCompraVentaSrvc.get().subscribe(res => {
      if (res) {
        this.tiposCompraVenta = res;
      }
    });
  }

  resetIngreso = () => {
    this.ingreso = {
      ingreso: null, tipo_movimiento: null, fecha: moment().format(GLOBAL.dbDateFormat), bodega: null,
      usuario: (this.ls.get(GLOBAL.usrTokenVar).idusr || 0), comentario: null, proveedor: null,
      estatus_movimiento: 1
    };
    this.resetDetalleIngreso();
    this.detallesIngreso = [];
    this.resetDocumento();
    this.updateTableDataSource();
    this.txtProveedorSelected = undefined;
  }

  onSubmit = () => {
    this.bloqueoBotones = true;
    this.ingresoSrvc.save(this.ingreso).subscribe(res => {
      // console.log(res);
      this.resetIngreso();
      if (res.exito) {
        this.ingreso = res.ingreso;
        this.setProveedor(+this.ingreso.proveedor);
      }
      this.ingresoSavedEv.emit();
      this.bloqueoBotones = false;
    });
  }

  loadArticulos = () => {
    this.articuloSrvc.getArticulosIngreso().subscribe(res => {
      if (res) {
        this.articulos = res;
      }
    });
  }

  resetDetalleIngreso = () => {
    this.detalleIngreso = {
      ingreso_detalle: null, ingreso: (!!this.ingreso.ingreso ? this.ingreso.ingreso : null), articulo: null,
      cantidad: null, precio_unitario: null, precio_total: null, presentacion: 0
    };
    this.txtArticuloSelected = undefined;
  }

  loadDetalleIngreso = (idingreso: number = +this.ingreso.ingreso) => {
    this.ingresoSrvc.getDetalle(idingreso, { ingreso: idingreso }).subscribe(res => {
      // console.log(res);
      if (res) {
        this.detallesIngreso = res;
        this.updateTableDataSource();
      }
    });
  }

  getDetalleIngreso = (idingreso: number = +this.ingreso.ingreso, iddetalle: number) => {
    this.ingresoSrvc.getDetalle(idingreso, { ingreso_detalle: iddetalle }).subscribe((res: any[]) => {
      // console.log(res);
      if (res) {
        this.detalleIngreso = {
          ingreso_detalle: res[0].ingreso_detalle,
          ingreso: res[0].ingreso,
          articulo: res[0].articulo.articulo,
          cantidad: +res[0].cantidad,
          precio_unitario: +res[0].precio_unitario,
          precio_total: +res[0].precio_total,
          presentacion: res[0].presentacion.presentacion
        };
        this.setPresentaciones();
        this.txtArticuloSelected = res[0].articulo;
        this.showDetalleIngresoForm = true;
      }
    });
  }

  onSubmitDetail = () => {
    this.bloqueoBotones = true;
    this.detalleIngreso.ingreso = this.ingreso.ingreso;
    this.detalleIngreso.precio_total = +this.detalleIngreso.cantidad * +this.detalleIngreso.precio_unitario;
    // console.log(this.detalleIngreso);
    this.ingresoSrvc.saveDetalle(this.detalleIngreso).subscribe(res => {
      // console.log(res);
      if (res) {
        this.loadDetalleIngreso();
        this.resetDetalleIngreso();
      }
      this.bloqueoBotones = false;
    });
  }

  addToDetail = () => {
    this.detallesIngreso.splice(this.detallesIngreso.findIndex(de => +de.articulo === +this.detalleIngreso.articulo), 1);
    var art:any;
    art = this.articulos.filter(p => +p.articulo == this.detalleIngreso.articulo);
    this.detalleIngreso.presentacion = art[0].presentacion_reporte;
    this.detallesIngreso.push(this.detalleIngreso);
    this.resetDetalleIngreso();
    this.updateTableDataSource();
  }

  editFromDetail = (idarticulo: number) => {
    var tmp = this.detallesIngreso.filter(de => +de.articulo === +idarticulo)[0];
    this.detalleIngreso = tmp;
    this.setPresentaciones();
    this.txtArticuloSelected = this.articulos.filter(p => +p.articulo == this.detalleIngreso.articulo)[0];
    //this.showDetalleIngresoForm = true;
    //
  }
    

  getDescripcionArticulo = (idarticulo: number) => this.articulos.find(art => +art.articulo === +idarticulo).descripcion || '';

  getDescripcionPresentacion = (idpresentacion: number) =>
    this.presentaciones.find(p => +p.presentacion === +idpresentacion).descripcion || '';

  updateTableDataSource = () => {
    this.dataSource = new MatTableDataSource(this.detallesIngreso);
    this.dataSource.filterPredicate = (data: DetalleIngreso, filter: string) => {
      return data.articulo.descripcion.toLowerCase().includes(filter);
    };
  }

  eliminarArticulo = (element: DetalleIngreso) => {
    // const idx = this.detallesIngreso.findIndex(d => d.ingreso_detalle === element.ingreso_detalle);
    this.detallesIngreso.splice(this.detallesIngreso.findIndex(d => d.ingreso_detalle === element.ingreso_detalle), 1);
    this.updateTableDataSource();
  }

  filtrarArticulos = (value: (Articulo | string)) => {
    if (value && (typeof value === 'string')) {
      const filterValue = value.toLowerCase();
      this.filteredArticulos =
        this.articulos.filter(a => a.descripcion.toLowerCase().includes(filterValue));
    } else {
      this.filteredArticulos = this.articulos;
    }
  }

  displayArticulo = (art: Articulo) => {
    if (art) {
      this.detalleIngreso.articulo = art.articulo;
      return art.descripcion;
    }
    return undefined;
  }

  filtrarProveedores = (value: (Proveedor | string)) => {
    if (value && (typeof value === 'string')) {
      const filterValue = value.toLowerCase();
      this.filteredProveedores =
        this.proveedores.filter(a => a.razon_social.toLowerCase().includes(filterValue) || a.nit.toLowerCase().includes(filterValue));
    } else {
      this.filteredProveedores = this.proveedores;
    }
  }

  displayProveedor = (p: Proveedor) => {
    if (p) {
      this.ingreso.proveedor = p.proveedor;
      return `(${p.nit}) ${p.razon_social}`;
    }
    return undefined;
  }

  setPresentaciones = () => {
    this.fltrPresentaciones = [];
    const idx = this.articulos.findIndex(p => +p.articulo === +this.detalleIngreso.articulo);
    const articulo = this.articulos[idx];
    this.fltrPresentaciones = this.presentaciones.filter(p => +p.medida.medida === +articulo.presentacion.medida);
  }

  setProveedor = (idProveedor: number) => this.txtProveedorSelected = this.proveedores.find(p => +p.proveedor === idProveedor);

  applyFilter = (filter: string) => {
    this.dataSource.filter = filter.toLocaleLowerCase();
  }

  resetDocumento = () => this.documento = {
    documento: null, ingreso: null, documento_tipo: null, serie: null, numero: null, fecha: null, tipo_compra_venta: null, enviado: 0
  }

  setDocumentoIngreso = (dc: any) => {
    this.documento = {
      documento: +dc.documento,
      ingreso: +dc.ingreso,
      documento_tipo: dc.documento_tipo.documento_tipo,
      serie: dc.serie,
      numero: dc.numero,
      fecha: dc.fecha,
      tipo_compra_venta: dc.tipo_compra_venta.tipo_compra_venta,
      enviado: dc.enviado
    };
  }

  loadDocumento = (idingreso: number = (this.ingreso.ingreso || null)) => {
    if (idingreso) {
      this.ingresoSrvc.getDocumento({ ingreso: idingreso }).subscribe((doc: Documento[]) => {
        if (doc && doc.length > 0) {
          this.setDocumentoIngreso(doc[0]);
        } else {
          this.resetDocumento();
        }
      });
    }
  }

  submitDocumento = () => {
    this.documento.ingreso = this.ingreso.ingreso;
    this.ingresoSrvc.saveDocumento(this.documento).subscribe(res => {
      if (res.exito) {
        this.setDocumentoIngreso(res.documento);
        this.snackBar.open('Documento guardado con éxito.', 'Ingreso', { duration: 3000 });
      } else {
        this.snackBar.open(`ERROR: ${res.mensaje}`, 'Ingreso', { duration: 7000 });
      }
    });
  }

  enviarAConta = () => {
    if (+this.documento?.documento > 0) {
      const confirmRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: new ConfirmDialogModel('Envío a contabilidad', 'Una vez enviado a contabilidad no podrá modificar el ingreso ni el documento. ¿Desea continuar?', 'Sí', 'No')
      });

      confirmRef.afterClosed().subscribe((confirma: boolean) => {
        if (confirma) {
          this.ingresoSrvc.enviarDocumentoAConta(this.documento.documento).subscribe(res => {
            if (res.exito) {
              this.documento = res.documento;
              this.snackBar.open('Documento enviado a contabilidad.', 'Ingreso', { duration: 3000 });
            } else {
              this.snackBar.open(`ERROR: ${res.mensaje}`, 'Ingreso', { duration: 7000 });
            }
          });
        }
      });
    }
  }
}

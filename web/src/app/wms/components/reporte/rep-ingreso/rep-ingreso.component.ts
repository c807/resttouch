import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportePdfService } from '../../../../restaurante/services/reporte-pdf.service';
import { AccesoUsuarioService } from '../../../../admin/services/acceso-usuario.service';
import { Bodega } from '../../../interfaces/bodega';
import { Articulo, ArticuloCodigo } from '../../../interfaces/articulo';
import { BodegaService } from '../../../services/bodega.service';
import { ArticuloService } from '../../../services/articulo.service';
import { ConfiguracionBotones } from '../../../../shared/interfaces/config-reportes';
import { TipoMovimiento } from '../../../interfaces/tipo-movimiento';
import { TipoMovimientoService } from '../../../services/tipo-movimiento.service';
import { saveAs } from 'file-saver';
import { GLOBAL } from '../../../../shared/global';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Proveedor } from '../../../interfaces/proveedor';
import { ProveedorService } from '../../../services/proveedor.service';
import { UsuarioSede } from '../../../../admin/interfaces/acceso';

@Component({
  selector: 'app-rep-ingreso',
  templateUrl: './rep-ingreso.component.html',
  styleUrls: ['./rep-ingreso.component.css']
})
export class RepIngresoComponent implements OnInit, OnDestroy {

  public bodegas: Bodega[] = [];
  public articulos: Articulo[] = [];
  public filteredArticulos: Articulo[] = [];
  public txtArticuloSelected: (Articulo | string) = undefined;
  public params: any = {};
  public titulo: string = "Ingreso";
  public cargando = false;
  public configBotones: ConfiguracionBotones = {
    showPdf: true, showHtml: false, showExcel: true
  };
  public tiposMovimiento: TipoMovimiento[] = [];

  public reportes = [
    {id: 1, descripcion: "Por proveedor"},
    {id: 2, descripcion: "Por producto"},
    {id: 3, descripcion: "Variación de precio"}
  ];

  private endSubs = new Subscription();
  public proveedores: Proveedor[] = [];
  public filteredProveedores: Proveedor[] = [];
  public txtProveedorSelected: (Proveedor | string) = undefined;
  public sedes: UsuarioSede[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private bodegaSrvc: BodegaService,
    private articuloSrvc: ArticuloService,
    private tipoMovimientoSrvc: TipoMovimientoService,
    private proveedorSrvc: ProveedorService,
    private sedeSrvc: AccesoUsuarioService,

  ) { }

  ngOnInit() {
    this.getSede();
    // this.getBodega();
    this.loadTiposMovimiento();
    this.loadProveedores();
    
    this.txtArticuloSelected = undefined;
    this.params.fdel = moment().startOf('month').format(GLOBAL.dbDateFormat);
    this.params.fal = moment().format(GLOBAL.dbDateFormat);
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  getSede = (params: any = {}) => {
    this.endSubs.add(
      this.sedeSrvc.getSedes(params).subscribe(res => {
        this.sedes = res;
      })
    );
  }

  loadTiposMovimiento = () => {
    this.tipoMovimientoSrvc.get({ ingreso: 1 }).subscribe(res => {
      if (res) {
        this.tiposMovimiento = res;
      }
    });
  }

  getBodega = (params: any = {}) => {
    this.endSubs.add(
      this.bodegaSrvc.get(params).subscribe(res => {
        this.bodegas = res;
      })
    );
  }

  getArticulo = (params: any = {}) => {
    this.endSubs.add(
      this.articuloSrvc.getArticulos(params).subscribe(res => {
        this.articulos = res;
      })
    );
  }

  loadProveedores = () => {
    this.proveedorSrvc.get().subscribe(res => {
      if (res) {
        this.proveedores = res;
      }
    });
  }

  filtrarArticulos = (value: (Articulo | string)) => {
    this.params.articulo = undefined
    if (value && (typeof value === 'string')) {
      const filterValue = value.toLowerCase();
      this.filteredArticulos = this.articulos.filter(a => a.descripcion.toLowerCase().includes(filterValue));
    } else {
      this.filteredArticulos = this.articulos;
    }
  }

  displayArticulo = (art: Articulo) => {
    if (art) {
      this.params.articulo = art.codigo;
      return `${art.descripcion} (${art.codigo})`;
    }
    return undefined;
  }

  filtrarProveedores = (value: (Proveedor | string)) => {
    this.params.proveedor = undefined
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
      this.params.proveedor = p.proveedor;
      return `(${p.nit}) ${p.razon_social}`;
    }
    return undefined;
  }

  setProveedor = (idProveedor: number) => this.txtProveedorSelected = this.proveedores.find(p => +p.proveedor === idProveedor);

  onSedesSelected = (obj: any) => {
    this.getBodega({ sede: this.params.sede });
    this.getArticulo({
      sede: this.params.sede,
      ingreso: 1,
      _activos: 1
    });
    this.params.articulo = undefined
    this.params.bodega = undefined
  }

  onSubmit(esExcel = 0) {
    // console.log(this.params); return;
    if (
      this.params.fdel && moment(this.params.fdel).isValid() && 
      this.params.fal && moment(this.params.fal).isValid() &&
      this.params.reporte && this.params.sede
    ) {
      this.params._excel = esExcel;
      this.cargando = true;
      this.endSubs.add(
        this.pdfServicio.getReporteIngreso(this.params).subscribe(res => {
          if (res) {
            const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
            saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
          } else {
            this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
          }
          this.cargando = false;
        })
      );
    } else {
      this.snackBar.open('Por favor ingrese todos los parámetros.', 'Kardex', { duration: 7000 });
    }
  }

  resetParams = () => {
    this.params = {
      fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat),
      reporte: undefined,
      tipo_ingreso: undefined,
      variacion: undefined,
      proveedor: undefined,
      articulo: undefined
    };
    this.txtArticuloSelected = undefined;
    this.filteredArticulos = [];
    this.cargando = false;
  }

}

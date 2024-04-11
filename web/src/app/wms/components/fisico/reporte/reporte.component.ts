import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectChange } from '@angular/material/select';
import { GLOBAL, OrdenarArrayObjetos, openInNewTab } from '@shared/global'; 
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';
import { Bodega } from '@wms-interfaces/bodega';
import { BodegaService } from '@wms-services/bodega.service';
import { Categoria } from '@wms-interfaces/categoria';
import { CategoriaGrupo } from '@wms-interfaces/categoria-grupo';
import { Articulo } from '@wms-interfaces/articulo';
import { ArticuloService } from '@wms-services/articulo.service';
import { FisicoService } from '@wms-services/fisico.service';
import { UsuarioSede } from '@admin-interfaces/acceso';
import { ConfiguracionService } from '@admin-services/configuracion.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css']
})
export class ReporteComponent implements OnInit, OnDestroy {

  @Input() esCuadreDiario = false;
  public bodegas: Bodega[] = [];
  public sedes: UsuarioSede[] = [];
  public params: any = {};
  public categorias: Categoria[] = [];
  public categoriasGruposPadre: CategoriaGrupo[] = [];
  public categoriasGrupos: CategoriaGrupo[] = [];
  public titulo: string = "Inventario_Fisico";
  public cargando = false;
  public showReporte = true;
  public maxDiasAntiguedadInventarioFisico = 1;
  public lstArticulos: Articulo[] = [];
  public lstArticulosOriginal: Articulo[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private sedeSrvc: AccesoUsuarioService,
    private bodegaSrvc: BodegaService,
    private articuloSrvc: ArticuloService,
    private fisicoSrvc: FisicoService,
    private configSrvc: ConfiguracionService,
  ) { }

  ngOnInit() {
    this.maxDiasAntiguedadInventarioFisico = (this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_MAX_DIAS_ANTIGUEDAD_INVENTARIO_FISICO) as number) || 1;
    this.getSede();    
    this.params.fecha = moment().format(GLOBAL.dbDateFormat);
    if (this.esCuadreDiario) {
      this.titulo = "Cuadre_Diario";
    }
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

  onSedeSelected = (obj: MatSelectChange) => {
    this.bodegas = [];
    this.params.bodega = null;    
    this.categorias = [];
    this.categoriasGruposPadre = [];
    this.categoriasGrupos = [];
    this.params.categoria_grupo_grupo = null;
    this.params.categoria = null;
    this.params.articulo = null;
    this.getBodega({ sede: +obj.value });
    this.loadCategorias({ sede: +obj.value });
    this.loadArticulos({ sede: +obj.value });
  }

  getBodega = (params: any = {}) => {
    this.endSubs.add(      
      this.bodegaSrvc.get(params).subscribe(res => {
        this.bodegas = res;
      })
    );
  }

  loadCategorias = (params: any = {}) => {
    this.endSubs.add(      
      this.articuloSrvc.getCategorias(params).subscribe(res => {
        this.categorias = res;
      })
    );
  }

  onCategoriaSelected = (obj: MatSelectChange) => {    
    this.params.categoria = +obj.value.categoria;
    this.params.categoria_grupo_grupo = null;
    this.params.articulo = null;
    this.loadSubCategorias(+obj.value.categoria);
    this.lstArticulos = this.lstArticulosOriginal.filter(a => +a.subcategoria.categoria === +obj.value.categoria);
  };

  loadSubCategorias = (idcategoria: number) => {
    this.endSubs.add(      
      this.articuloSrvc.getCategoriasGrupos({ categoria: +idcategoria }).subscribe(res => {
        if (res) {
          this.categoriasGruposPadre = this.articuloSrvc.adaptCategoriaGrupoResponse(res);
          this.categoriasGrupos = this.categoriasGruposPadre;
        }
      })
    );
  }

  // onSubCategoriaPadreSelected = (obj: any) => this.loadSubCategoriasSubcategorias(+obj.value);

  loadSubCategoriasSubcategorias = (idsubcat: number) => {
    this.endSubs.add(      
      this.articuloSrvc.getCategoriasGrupos({ categoria_grupo_grupo: idsubcat }).subscribe(res => {
        if (res) {
          this.categoriasGrupos = this.articuloSrvc.adaptCategoriaGrupoResponse(res);
        }
      })
    );
  }

  loadArticulos = (params: any = {}) => {
    params.mostrar_inventario = 1;
    this.endSubs.add(
      this.articuloSrvc.getArticulos(params).subscribe(res => {
        this.lstArticulos = OrdenarArrayObjetos(res, 'descripcion');
        this.lstArticulosOriginal = JSON.parse(JSON.stringify(this.lstArticulos));
      })
    );
  }

  onSubmit() {
    this.params.escuadrediario = this.esCuadreDiario ? 1 : 0;        
    if (this.validarFecha()) {
      this.cargando = true;
      this.endSubs.add(      
        this.fisicoSrvc.generarInventarioFisico(this.params).subscribe(res => {
          this.cargando = false;      
          if (res.exito) {
            this.cargando = true;
            let sedeFound = this.sedes.find(sede => sede.sede.sede === this.params.sede);
              if (sedeFound && sedeFound.sede) {
                this.params.sede = sedeFound.sede.nombre + " (" + sedeFound.sede.alias + ")";
              }

            let bodegaFound = this.bodegas.find(bodega => bodega.bodega === this.params.bodega);
              if (bodegaFound) {
                this.params.bodega = bodegaFound.descripcion;
              }
            this.endSubs.add(          
              this.pdfServicio.imprimirInventarioFisico(res.inventario, this.params).subscribe(resImp => {
                this.cargando = false;
                if (this.params._excel) {
                  const blob = new Blob([resImp], { type: 'application/vnd.ms-excel' });
                  saveAs(blob, `${this.titulo}.xls`);
                } else {
                  const blob = new Blob([resImp], { type: 'application/pdf' });
                  openInNewTab(URL.createObjectURL(blob));                  
                }
              })
            );
          } else {
            this.snackBar.open('No se pudo generar el reporte... ' + res.mensaje, this.titulo, { duration: 3000 });
          }
        })
      );
    } else {
      const ayer = moment().subtract(1, 'days').format(GLOBAL.dateFormat);
      const hoy = moment().format(GLOBAL.dateFormat);
      this.snackBar.open(`La fecha debe estar entre ${ayer} y ${hoy}`, this.titulo, { duration: 7000 });
    }
  }

  validarFecha = (): boolean => {
    let valida = true;    
    let momento = moment();
    const hoy = momento.clone();
    const fechaIngresada = moment(`${this.params.fecha} ${momento.format(GLOBAL.timeFormatMilli)}`);
    const fechaLimite = momento.subtract(this.maxDiasAntiguedadInventarioFisico, 'days');    
    valida = !(fechaIngresada.isBefore(fechaLimite) || fechaIngresada.isAfter(hoy));
    return valida;
  }

  subcategoriaSelectedEv = (obj: MatSelectChange) => {    
    this.lstArticulos = this.lstArticulosOriginal.filter(a => +a.categoria_grupo === +obj.value);
    this.params.articulo = null;
  }
}

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportePdfService } from '../../../../restaurante/services/reporte-pdf.service';
// import { SedeService } from '../../../../admin/services/sede.service';
import { AccesoUsuarioService } from '../../../../admin/services/acceso-usuario.service';
import { Bodega } from '../../../interfaces/bodega';
import { BodegaService } from '../../../services/bodega.service';
import { Categoria } from '../../../interfaces/categoria';
import { CategoriaGrupo } from '../../../interfaces/categoria-grupo';
import { ArticuloService } from '../../../services/articulo.service';
import { FisicoService } from '../../../services/fisico.service';
// import { Sede } from '../../../../admin/interfaces/sede';
import { UsuarioSede } from '../../../../admin/interfaces/acceso';
import { saveAs } from 'file-saver';
import { GLOBAL } from '../../../../shared/global';
import * as moment from 'moment';
import { MatSelectChange } from '@angular/material/select';
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

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private sedeSrvc: AccesoUsuarioService,
    private bodegaSrvc: BodegaService,
    private articuloSrvc: ArticuloService,
    private fisicoSrvc: FisicoService    
  ) { }

  ngOnInit() {
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
    this.getBodega({ sede: +obj.value });
    this.loadCategorias({ sede: +obj.value });
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

  onCategoriaSelected = (obj: any) => this.loadSubCategorias(+obj.value.categoria);

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

  onSubCategoriaPadreSelected = (obj: any) => this.loadSubCategoriasSubcategorias(+obj.value);

  loadSubCategoriasSubcategorias = (idsubcat: number) => {
    this.endSubs.add(      
      this.articuloSrvc.getCategoriasGrupos({ categoria_grupo_grupo: idsubcat }).subscribe(res => {
        if (res) {
          this.categoriasGrupos = this.articuloSrvc.adaptCategoriaGrupoResponse(res);
        }
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
            this.endSubs.add(          
              this.pdfServicio.imprimirInventarioFisico(res.inventario, this.params).subscribe(resImp => {
                if (this.params._excel) {
                  const blob = new Blob([resImp], { type: 'application/vnd.ms-excel' });
                  saveAs(blob, `${this.titulo}.xls`);
                } else {
                  const blob = new Blob([resImp], { type: 'application/pdf' });
                  saveAs(blob, `${this.titulo}.pdf`);
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
    const fechaLimite = momento.subtract(1, 'days');
    valida = !(fechaIngresada.isBefore(fechaLimite) || fechaIngresada.isAfter(hoy));    
    return valida;
  }

}

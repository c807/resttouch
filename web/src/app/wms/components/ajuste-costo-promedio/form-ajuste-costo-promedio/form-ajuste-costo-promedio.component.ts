import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL, MultiFiltro, OrdenarArrayObjetos } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import * as moment from 'moment';

import { AjusteCostoPromedio } from '@wms-interfaces/ajuste-costo-promedio';
import { DetalleAjusteCostoPromedio } from '@wms-interfaces/detalle-ajuste-costo-promedio';
import { AjusteCostoPromedioService } from '@wms-services/ajuste-costo-promedio.service';

import { Bodega } from '@wms-interfaces/bodega';
import { BodegaService } from '@wms-services/bodega.service';
import { UsuarioSede } from '@admin-interfaces/acceso';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';
import { Categoria } from '@wms-interfaces/categoria';
import { CategoriaGrupo } from '@wms-interfaces/categoria-grupo';
import { Articulo } from '@wms-interfaces/articulo';
import { ArticuloService } from '@wms-services/articulo.service';

import { Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-form-ajuste-costo-promedio',
  templateUrl: './form-ajuste-costo-promedio.component.html',
  styleUrls: ['./form-ajuste-costo-promedio.component.css']
})
export class FormAjusteCostoPromedioComponent implements OnInit, OnDestroy {

  get sedeActual(): number {
    return this.ls.get(GLOBAL.usrTokenVar).sede as number;
  }

  get usuarioActual(): number {
    return this.ls.get(GLOBAL.usrTokenVar).idusr as number;
  }

  @Input() ajusteCostoPromedio: AjusteCostoPromedio;
  @Output() ajusteCostoPromedioSavedEv = new EventEmitter();
  public detalleAjusteCostoPromedio: DetalleAjusteCostoPromedio[] = [];
  public detalleAjusteCostoPromedioOriginal: DetalleAjusteCostoPromedio[] = [];
  public bodegas: Bodega[] = [];
  public sedes: UsuarioSede[] = [];
  public categorias: Categoria[] = [];
  public categoriasGruposPadre: CategoriaGrupo[] = [];
  public lstArticulos: Articulo[] = [];
  public lstArticulosOriginal: Articulo[] = [];
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public txtFiltro = '';

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private ajusteCostoPromedioSrvc: AjusteCostoPromedioService,
    private ls: LocalstorageService,
    private bodegaSrvc: BodegaService,
    private sedeSrvc: AccesoUsuarioService,
    private articuloSrvc: ArticuloService
  ) { }

  ngOnInit(): void {    
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetAjusteCostoPromedio();
    this.loadSedes();    
  }

  ngOnDestroy(): void {    
    this.endSubs.unsubscribe();
  }

  loadSedes = (params: any = {}) => {
    this.endSubs.add(      
      this.sedeSrvc.getSedes(params).subscribe(res => {
        this.sedes = res;
      })
    );
  }

  onSedeSelected = (obj: MatSelectChange) => {
    this.bodegas = [];
    this.ajusteCostoPromedio.bodega = null;    
    this.categorias = [];
    this.categoriasGruposPadre = [];    
    this.ajusteCostoPromedio.categoria_grupo = null;    
    this.ajusteCostoPromedio.articulo = null;
    this.loadBodegas({ sede: +obj.value });
    this.loadCategorias({ sede: +obj.value });
    this.loadArticulos({ sede: +obj.value });
  }

  loadBodegas = (params: any = {}) => {
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
    this.ajusteCostoPromedio.categoria_grupo = null;
    this.ajusteCostoPromedio.articulo = null;
    this.loadSubCategorias(+obj.value.categoria);
    this.lstArticulos = this.lstArticulosOriginal.filter(a => +a.subcategoria.categoria === +obj.value.categoria);
  };

  loadSubCategorias = (idcategoria: number) => {
    this.endSubs.add(      
      this.articuloSrvc.getCategoriasGrupos({ categoria: +idcategoria }).subscribe(res => {
        this.categoriasGruposPadre = this.articuloSrvc.adaptCategoriaGrupoResponse(res);        
      })
    );
  }

  subcategoriaSelectedEv = (obj: MatSelectChange) => {    
    this.lstArticulos = this.lstArticulosOriginal.filter(a => +a.categoria_grupo === +obj.value);
    this.ajusteCostoPromedio.articulo = null;
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

  resetAjusteCostoPromedio() {
    this.ajusteCostoPromedio = {
      ajuste_costo_promedio: null,
      sede: null,
      usuario: this.usuarioActual,
      categoria_grupo: null,
      bodega: null,
      fecha: moment().format(GLOBAL.dbDateFormat),
      notas: null,
      confirmado: 0
    };

    this.detalleAjusteCostoPromedio = [];
    this.detalleAjusteCostoPromedioOriginal = [];
  }

  onSubmit() {
    this.endSubs.add(
      this.ajusteCostoPromedioSrvc.save(this.ajusteCostoPromedio).subscribe((res) => {
        if (res.exito) {
          this.ajusteCostoPromedio = res.ajuste_costo_promedio as AjusteCostoPromedio;
          this.loadDetalleAjusteCostoPromedio(this.ajusteCostoPromedio.ajuste_costo_promedio);
          this.ajusteCostoPromedioSavedEv.emit();
          this.snackBar.open(res.mensaje, 'Ajuste de costo promedio', { duration: 5000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Ajuste de costo promedio', { duration: 5000 });
        }
      })
    );
  }

  loadDetalleAjusteCostoPromedio = (idAjusteCostoPromedio: number = null) => {
    if (!idAjusteCostoPromedio) {
      idAjusteCostoPromedio = this.ajusteCostoPromedio.ajuste_costo_promedio;
    }

    this.endSubs.add(
      this.ajusteCostoPromedioSrvc.getDetalle({ ajuste_costo_promedio: idAjusteCostoPromedio }).subscribe((res) => {        
        this.detalleAjusteCostoPromedioOriginal = res;
        this.detalleAjusteCostoPromedio = JSON.parse(JSON.stringify(this.detalleAjusteCostoPromedioOriginal));
      })
    );
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.detalleAjusteCostoPromedioOriginal, this.txtFiltro);      
      this.detalleAjusteCostoPromedio = JSON.parse(JSON.stringify(tmpList));
    } else {
      this.detalleAjusteCostoPromedio = JSON.parse(JSON.stringify(this.detalleAjusteCostoPromedioOriginal));
    }    
  }

  moveNextElement = (objKeybEv: KeyboardEvent, obj: DetalleAjusteCostoPromedio) => {        
    this.endSubs.add(
      this.ajusteCostoPromedioSrvc.saveDetalle(obj).subscribe((res) => {
        if (res.exito) {
          this.snackBar.open(res.mensaje, 'Detalle de ajuste de costo promedio', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Detalle de ajuste de costo promedio', { duration: 5000 });
        }
        const srcElem = objKeybEv.target as HTMLInputElement;
        const idx = +srcElem.id.split('_')[1];
        let nextElement = document.getElementById(`costoPromedioCorrecto_${idx + 1}`);    
        if (nextElement) {
          nextElement.focus();
        } else {
          nextElement = document.getElementById('costoPromedioCorrecto_0');
          if (nextElement) {
            nextElement.focus();
          }
        }      
      })
    );
  }
}

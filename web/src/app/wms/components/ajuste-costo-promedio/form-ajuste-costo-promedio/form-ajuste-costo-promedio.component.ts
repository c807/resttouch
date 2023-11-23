import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
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
import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';

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

  get noSePuedeConfirmar(): boolean {
    let noConfirmable = false;
    if (this.detalleAjusteCostoPromedioOriginal.length === 0) {
      return true;
    }

    for (const detalleacp of this.detalleAjusteCostoPromedioOriginal) {
      if (!detalleacp || !detalleacp.costo_promedio_correcto || +detalleacp.costo_promedio_correcto <= 0) {
        noConfirmable = true;
        break;
      }
    }

    return noConfirmable;
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
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private ajusteCostoPromedioSrvc: AjusteCostoPromedioService,
    private ls: LocalstorageService,
    private bodegaSrvc: BodegaService,
    private sedeSrvc: AccesoUsuarioService,
    private articuloSrvc: ArticuloService,
    public dialog: MatDialog
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
    this.cargando = true;
    this.endSubs.add(
      this.ajusteCostoPromedioSrvc.save(this.ajusteCostoPromedio).subscribe((res) => {
        if (res.exito) {
          this.ajusteCostoPromedio = res.ajuste_costo_promedio as AjusteCostoPromedio;
          this.loadDetalleAjusteCostoPromedio(this.ajusteCostoPromedio.ajuste_costo_promedio);
          this.ajusteCostoPromedioSavedEv.emit();
          this.snackBar.open(res.mensaje, 'Ajuste', { duration: 5000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Ajuste', { duration: 5000 });
        }
        this.cargando = false;
      })
    );
  }

  loadDetalleAjusteCostoPromedio = (idAjusteCostoPromedio: number = null) => {
    this.cargando = true;
    if (!idAjusteCostoPromedio) {
      idAjusteCostoPromedio = this.ajusteCostoPromedio.ajuste_costo_promedio;
    }

    this.endSubs.add(
      this.ajusteCostoPromedioSrvc.getDetalle({ ajuste_costo_promedio: idAjusteCostoPromedio }).subscribe((res) => {
        this.detalleAjusteCostoPromedioOriginal = res;
        this.detalleAjusteCostoPromedio = JSON.parse(JSON.stringify(this.detalleAjusteCostoPromedioOriginal));
        this.cargando = false;
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

  moveNextElement = (objKeybEv: KeyboardEvent) => {
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
  }

  saveDetalleAjusteCostoPromedio = (obj: DetalleAjusteCostoPromedio) => {
    this.cargando = true;
    if (obj && obj.costo_promedio_correcto && +obj.costo_promedio_correcto > 0) {
      this.endSubs.add(
        this.ajusteCostoPromedioSrvc.saveDetalle(obj).subscribe((res) => {
          if (res.exito) {
            const resDetAcp = res.detalle_ajuste_costo_promedio as DetalleAjusteCostoPromedio;
            let idx = this.detalleAjusteCostoPromedio.findIndex(d => +d.detalle_ajuste_costo_promedio === +obj.detalle_ajuste_costo_promedio);
            if (idx >= 0) {
              this.detalleAjusteCostoPromedio[idx].costo_promedio_correcto = +resDetAcp.costo_promedio_correcto;
            }
            idx = this.detalleAjusteCostoPromedioOriginal.findIndex(d => +d.detalle_ajuste_costo_promedio === +obj.detalle_ajuste_costo_promedio);
            if (idx >= 0) {
              this.detalleAjusteCostoPromedioOriginal[idx].costo_promedio_correcto = +resDetAcp.costo_promedio_correcto;
            }
            this.snackBar.open(res.mensaje, 'Ajuste', { duration: 3000 });
          } else {
            this.snackBar.open(`ERROR: ${res.mensaje}`, 'Ajuste', { duration: 5000 });
          }
          this.cargando = false;
        })
      );
    } else {
      this.snackBar.open(`ERROR: El costo promedio correcto debe ser mayor a cero (0).`, 'Ajuste', { duration: 5000 });
      this.cargando = false;
    }
  }

  confirmarAjusteCostoPromedio = () => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel('Ajuste de costo promedio', 'Esto confirmará el ajuste de costo promedio y ya no podrá modificarlo. ¿Desea continuar?', 'Sí', 'No')
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe((confirma: boolean) => {
        if (confirma) {
          this.cargando = true;
          this.endSubs.add(
            this.ajusteCostoPromedioSrvc.confirmar(this.ajusteCostoPromedio.ajuste_costo_promedio).subscribe((res) => {
              if (res.exito) {
                this.ajusteCostoPromedio = res.ajuste_costo_promedio as AjusteCostoPromedio;
                this.loadDetalleAjusteCostoPromedio(this.ajusteCostoPromedio.ajuste_costo_promedio);
                this.snackBar.open(res.mensaje, 'Ajuste', { duration: 5000 });
              } else {
                this.snackBar.open(`ERROR: ${res.mensaje}`, 'Ajuste', { duration: 5000 });
              }
              this.cargando = false;
            })
          );
        }
      })
    );
  }

  saveAllDetalle = () => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel('Ajuste de costo promedio', 'Esto guardará todos los detalles con costo mayor a cero (0). ¿Desea continuar?', 'Sí', 'No')
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe(async (confirma: boolean) => {
        if (confirma) {
          this.cargando = true;
          for (const dacp of this.detalleAjusteCostoPromedio) {
            if (dacp && dacp.costo_promedio_correcto && +dacp.costo_promedio_correcto > 0) {
              await this.ajusteCostoPromedioSrvc.saveDetalle(dacp).toPromise();
            }
          }
          this.cargando = false;
        }
      })
    );
  }
}

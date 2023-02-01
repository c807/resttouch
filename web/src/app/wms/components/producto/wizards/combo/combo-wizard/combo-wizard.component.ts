import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar'
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL, OrdenarArrayObjetos } from '@shared/global';

import { DetalleComboWizardComponent } from '@wms-components/producto/wizards/combo/detalle-combo-wizard/detalle-combo-wizard.component';

import { Articulo } from '@wms-interfaces/articulo';
import { ArticuloDetalle } from '@wms-interfaces/articulo-detalle';
import { SubCategoriaSimpleSearch } from '@wms-interfaces/categoria-grupo';
import { ArticuloService } from '@wms-services/articulo.service';
import { Presentacion } from '@admin-interfaces/presentacion';
import { PresentacionService } from '@admin-services/presentacion.service';

import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-combo-wizard',
  templateUrl: './combo-wizard.component.html',
  styleUrls: ['./combo-wizard.component.css']
})
export class ComboWizardComponent implements OnInit, OnDestroy {

  get descripcionArticulo(): FormControl {
    return this.encabezadoFormGroup.get('descripcion') as FormControl;
  }  

  get filtroSubcategoria(): FormControl {
    return this.encabezadoFormGroup.get('filtroSubcategoria') as FormControl;    
  }

  get categoriaGrupoArticulo(): FormControl {
    return this.encabezadoFormGroup.get('categoria_grupo') as FormControl;
  }

  get filtroPresentacion(): FormControl {
    return this.encabezadoFormGroup.get('filtroPresentacion') as FormControl;    
  }

  get presentacion(): FormControl {
    return this.encabezadoFormGroup.get('presentacion') as FormControl;    
  }

  get presentacion_reporte(): FormControl {
    return this.encabezadoFormGroup.get('presentacion_reporte') as FormControl;
  }

  get precioArticulo(): FormControl {
    return this.encabezadoFormGroup.get('precio') as FormControl;    
  }

  get codigoArticulo(): FormControl {
    return this.encabezadoFormGroup.get('codigo') as FormControl;    
  }

  get cobro_mas_caro(): FormControl {
    return this.encabezadoFormGroup.get('cobro_mas_caro') as FormControl;
  }  

  get todo_correcto(): FormControl {
    return this.todoCorrectoFormGroup.get('todo_correcto') as FormControl;
  }

  @ViewChild('stepper') pasoAPaso: MatStepper;
  @ViewChild('txtPrecio') txtPrecio: ElementRef;

  // public articulo: Articulo;
  public encabezadoFormGroup: FormGroup;
  public todoCorrectoFormGroup: FormGroup;
  public myControl = new FormControl();
  public lstSubCategorias: SubCategoriaSimpleSearch[] = [];
  public lstSubCategoriasFiltered: Observable<SubCategoriaSimpleSearch[]>;
  public lstPresentaciones: Presentacion[] = [];
  public lstPresentacionesFiltered: Observable<Presentacion[]>;
  public detalleCombo: any[] = [];
  public articulo: Articulo;
  public receta: ArticuloDetalle;

  private endSubs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private ls: LocalstorageService,
    private articuloSrvc: ArticuloService,
    private presentacionSrvc: PresentacionService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.encabezadoFormGroup = this.fb.group({
      descripcion: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(250)]],
      filtroSubcategoria: ['', Validators.required],
      categoria_grupo: [null, Validators.required],
      filtroPresentacion: ['', Validators.required],
      presentacion: [null, Validators.required],
      presentacion_reporte: [null, Validators.required],
      precio: [null, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
      codigo: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(25)]],
      cobro_mas_caro: ['0', Validators.required]
    });

    this.todoCorrectoFormGroup = this.fb.group({
      todo_correcto: [false, Validators.required]
    });


    this.loadSubCategorias();
    this.lstSubCategoriasFiltered = this.filtroSubcategoria.valueChanges.pipe(
      startWith(''),
      map(value => this.filtrarSubCategorias(value))
    );

    this.loadPresentaciones();
    this.lstPresentacionesFiltered = this.filtroPresentacion.valueChanges.pipe(
      startWith(''),
      map(value => this.filtrarPresentaciones(value))
    );
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadSubCategorias = () => {
    this.endSubs.add(
      this.articuloSrvc.getCategoriasGruposSimple({ sede: this.ls.get(GLOBAL.usrTokenVar).sede, debaja: 0, _todos:true }).subscribe(res => {        
        this.lstSubCategorias = OrdenarArrayObjetos(res, 'descripcion');
      })
    );
  }

  loadPresentaciones = () => {
    this.endSubs.add(      
      this.presentacionSrvc.get().subscribe((res: Presentacion[]) => {
        this.lstPresentaciones = res.filter(p => +p.cantidad === 1);
        const presUnidad = this.lstPresentaciones.find(p => p.descripcion.trim().toLowerCase() === 'unidad');
        if (presUnidad) {
          this.presentacion.patchValue(presUnidad.presentacion);
          this.presentacion_reporte.patchValue(presUnidad.presentacion);
          this.filtroPresentacion.patchValue(presUnidad);
        }
      })
    );
  }

  private filtrarSubCategorias = (value: string): SubCategoriaSimpleSearch[] => {
    if (value && (typeof value === 'string') && value !== '') {
      const filtro = value.toLowerCase();
      return this.lstSubCategorias.filter(sc => sc.descripcion.toLowerCase().includes(filtro));
    } else {
      return this.lstSubCategorias;
    }
  }

  subcategoriaDisplay = (sc: SubCategoriaSimpleSearch) => sc && sc.descripcion ? `${sc.descripcion} (${sc.categoria})` : '';

  subcategoriaSelectedEv = (sc: MatAutocompleteSelectedEvent) => {
    const subcat = sc.option.value as SubCategoriaSimpleSearch;
    this.categoriaGrupoArticulo.patchValue(subcat.categoria_grupo);
    this.setFocusOnPrecio();
  }

  setFocusOnPrecio = () => {
    if (+this.presentacion.value > 0 && +this.presentacion_reporte.value > 0 && +this.filtroPresentacion?.value?.presentacion > 0) {
      if (this.txtPrecio) {
        this.txtPrecio.nativeElement.focus();
      }
    }
  }

  private filtrarPresentaciones = (value: string): Presentacion[] => {
    if (value && (typeof value === 'string') && value !== '') {
      const filtro = value.toLowerCase();
      return this.lstPresentaciones.filter(p => p.descripcion.toLowerCase().includes(filtro));
    } else {
      return this.lstPresentaciones;
    }
  }

  presentacionDisplay = (p: Presentacion) => p && p.descripcion ? p.descripcion : '';

  presentacionSelectedEv = (p: MatAutocompleteSelectedEvent) => {
    const pres = p.option.value as Presentacion;
    this.presentacion.patchValue(pres.presentacion);
    this.presentacion_reporte.patchValue(pres.presentacion);    
  }

  addDetalleCombo = (tipoProducto: number) => {
    const detComboDialog = this.dialog.open(DetalleComboWizardComponent, {
      width: '75%', height: '55vh',
      disableClose: true,
      data: { tipoProducto }
    });

    this.endSubs.add(
      detComboDialog.afterClosed().subscribe(det => {        
        if (det) {
          this.detalleCombo.push({
            articulo: +det.articulo || null,
            cantidad: +det.cantidad || 1,
            medida: +det.medida || null,
            precio: +det.precio || 0,
            precio_extra: +det.precio_extra || 0,
            descripcion_articulo: det?.filtroArticulo?.descripcion || '',
            descripcion_medida: det?.filtroMedida?.descripcion || ''
          });
        }
      })
    );
  }

  guardarCombo = () => {
    this.articulo = {
      articulo: null,
      categoria_grupo: this.categoriaGrupoArticulo.value as number,
      descripcion: this.descripcionArticulo.value as string,
      precio: this.precioArticulo.value as number,
      presentacion: this.presentacion.value as number,
      presentacion_reporte: this.presentacion_reporte.value as number,
      codigo: this.codigoArticulo.value as string,
      shopify_id: null, 
      bien_servicio: 'B',
      rendimiento: 0,
      cantidad_minima: this.detalleCombo.length,
      cantidad_maxima: this.detalleCombo.length,
      stock_minimo: null,
      stock_maximo: null,
      impuesto_especial: null,
      cantidad_gravable: 0,
      precio_sugerido: 0,
      produccion: 0,
      mostrar_pos: 1,
      combo: 1,
      multiple: 0,
      mostrar_inventario: 0,
      esreceta: 0,
      cobro_mas_caro: this.cobro_mas_caro.value as number,
      esextra: 0,
      costo: 0,
      debaja: 0
    }

    this.endSubs.add(
      this.articuloSrvc.saveArticulo(this.articulo).subscribe(artSvd => {
        if (artSvd.exito) {
          let msgErrores = []
          this.detalleCombo.forEach(async (detCmb, i) => {
            this.receta = {
              articulo_detalle: null,
              receta: artSvd.articulo.articulo,
              articulo: +detCmb.articulo,
              cantidad: +detCmb.cantidad,
              precio_extra: +detCmb.precio === 0 ? 0 : 1,
              medida: +detCmb.medida,
              racionable: 0,
              precio: +detCmb.precio,
              anulado: 0
            };
            
            const detSvd = await this.articuloSrvc.saveArticuloDetalle(this.receta).toPromise();
            if (!detSvd.exito) {
              msgErrores.push(detSvd.mensaje)
            }

          });
          if (msgErrores.length > 0) {
            this.snackbar.open(`ERROR${msgErrores.length === 1 ? '' : 'ES'}: ${msgErrores.join(', ')}`, 'Paso a paso: combo', { duration: 7000 });
          } else {
            this.snackbar.open(`El combo '${this.descripcionArticulo.value}' fue grabado con éxito.`, 'Paso a paso: combo', { duration: 5000 });
            this.pasoAPaso.next();
          }
        } else {
          this.snackbar.open(`ERROR: ${artSvd.mensaje}`, 'Paso a paso: combo', { duration: 7000 });
        }
      })
    );
  }

}

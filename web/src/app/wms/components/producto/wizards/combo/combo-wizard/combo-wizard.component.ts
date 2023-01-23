import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '../../../../../../admin/services/localstorage.service';
import { GLOBAL, OrdenarArrayObjetos } from '../../../../../../shared/global';

import { DetalleComboWizardComponent } from '../detalle-combo-wizard/detalle-combo-wizard.component';

// import { Articulo } from '../../../../interfaces/articulo';
import { SubCategoriaSimpleSearch } from '../../../../../interfaces/categoria-grupo';
import { ArticuloService } from '../../../../../services/articulo.service';
import { Presentacion } from '../../../../../../admin/interfaces/presentacion';
import { PresentacionService } from '../../../../../../admin/services/presentacion.service';

import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

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

  get detalle(): FormArray {
    return this.detalleFormGroup.get('detalle') as FormArray;
  }

  // public articulo: Articulo;
  public encabezadoFormGroup: FormGroup;
  public myControl = new FormControl();
  public lstSubCategorias: SubCategoriaSimpleSearch[] = [];
  public lstSubCategoriasFiltered: Observable<SubCategoriaSimpleSearch[]>;
  public lstPresentaciones: Presentacion[] = [];
  public lstPresentacionesFiltered: Observable<Presentacion[]>;
  
  public detalleFormGroup: FormGroup;

  private endSubs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private ls: LocalstorageService,
    private articuloSrvc: ArticuloService,
    private presentacionSrvc: PresentacionService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.encabezadoFormGroup = this.fb.group({
      descripcion: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(250)]],
      filtroSubcategoria: ['', Validators.required],
      categoria_grupo: [null, Validators.required],
      filtroPresentacion: ['', Validators.required],
      presentacion: [null, Validators.required],
      presentacion_reporte: [null, Validators.required],
      precio: [null, [Validators.required, Validators.min(0)]],
      codigo: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(25)]],
      cobro_mas_caro: ['0', Validators.required]
    });
    
    this.detalleFormGroup = this.fb.group({      
      detalle: this.fb.array([
        this.fb.group({
          articulo: [],
          cantidad: [1, Validators.required],
          medida: [null, Validators.required],
          precio: [0, Validators.required]
        })
      ]),
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
        console.log('DETALLE = ', det);
      })
    );

  }

}

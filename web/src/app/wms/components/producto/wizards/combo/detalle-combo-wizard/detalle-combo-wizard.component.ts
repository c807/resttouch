import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL } from '@shared/global';

import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared-components/confirm-dialog/confirm-dialog.component';

import { Articulo } from '@wms-interfaces/articulo';
import { ArticuloService } from '@wms-services/articulo.service';
import { Medida } from '@admin-interfaces/medida';
import { MedidaService } from '@admin-services/medida.service';

import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

interface IDetalleComboDialogWizard {
  tipoProducto: number
}

@Component({
  selector: 'app-detalle-combo-wizard',
  templateUrl: './detalle-combo-wizard.component.html',
  styleUrls: ['./detalle-combo-wizard.component.css']
})
export class DetalleComboWizardComponent implements OnInit, OnDestroy {

  get medida(): FormControl {
    return this.productoFrmGrp.get('medida') as FormControl;
  }

  get filtroMedida(): FormControl {
    return this.productoFrmGrp.get('filtroMedida') as FormControl;
  }

  get articulo(): FormControl {
    return this.productoFrmGrp.get('articulo') as FormControl;
  }

  get filtroArticulo(): FormControl {
    return this.productoFrmGrp.get('filtroArticulo') as FormControl;
  }

  get cantidad(): FormControl {
    return this.productoFrmGrp.get('cantidad') as FormControl;
  }

  get precio(): FormControl {
    return this.productoFrmGrp.get('precio') as FormControl;
  }

  get precio_extra(): FormControl {
    return this.productoFrmGrp.get('precio_extra') as FormControl;
  }

  get esOpcionMultiple(): boolean {
    return +this.data.tipoProducto !== 1;
  }

  public articulos: Articulo[] = [];
  public articulosFiltered: Observable<Articulo[]>;
  public medidas: Medida[] = [];
  public medidasFiltered: Observable<Medida[]>;
  public productoFrmGrp: FormGroup;
  public height: string = '350px';

  private endSubs = new Subscription();

  constructor(
    public dialogWizRef: MatDialogRef<DetalleComboWizardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDetalleComboDialogWizard,
    private dialog: MatDialog,
    private ls: LocalstorageService,
    private articuloSrvc: ArticuloService,
    private medidaSrvc: MedidaService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.productoFrmGrp = this.fb.group({
      filtroArticulo: ['', Validators.required],
      articulo: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(999999)]],
      filtroMedida: ['', Validators.required],
      medida: [null, Validators.required],
      precio: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
      precio_extra: [0]
    });    

    this.loadMedidas();
    this.medidasFiltered = this.filtroMedida.valueChanges.pipe(
      startWith(''),
      map(value => this.filtrarMedidas(value))
    );

    this.loadArticulos();
    this.articulosFiltered = this.filtroArticulo.valueChanges.pipe(
      startWith(''),
      map(value => this.filtrarArticulos(value))
    );    
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadMedidas = () => {
    this.endSubs.add(
      this.medidaSrvc.get().subscribe(lstMedidas => {
        this.medidas = lstMedidas;
        const umunidad: Medida = this.medidas.find(m => m.descripcion.trim().toLowerCase() === 'unidad');
        if (umunidad) {
          this.medida.patchValue(umunidad.medida);
          this.filtroMedida.patchValue(umunidad);
        } else if (+this.data.tipoProducto === 2) {
          this.snackbar.open("No logré encontrar la unidad de medida 'UNIDAD'. Es necesaria para agregar este tipo de producto.", (+this.data.tipoProducto === 1 ? 'Producto terminado' : 'Opción múltiple'), { duration: 7000 });
          this.dialogWizRef.close(null);
        }
      })
    );
  }

  loadArticulos = () => {
    const fltr: any = {
      sede: this.ls.get(GLOBAL.usrTokenVar).sede,
      debaja: 0,
      _todos: true,
      combo: 0
    }

    if (+this.data.tipoProducto === 1) {
      fltr.multiple = 0;
    } else {
      fltr.multiple = 1;
    }

    this.endSubs.add(
      this.articuloSrvc.getArticulos(fltr, true).subscribe(lstArts => this.articulos = lstArts)
    );
  }

  filtrarArticulos = (value: string): Articulo[] => {
    if (value && (typeof value === 'string') && value !== '') {
      const filtro = value.toLowerCase();
      return this.articulos.filter(a => a.descripcion.toLowerCase().includes(filtro));
    } else {
      return this.articulos;
    }
  }

  articuloDisplay = (obj: Articulo) => obj && obj.descripcion ? obj.descripcion : '';

  articuloSelectedEv = (obj: MatAutocompleteSelectedEvent) => {
    const art = obj.option.value as Articulo;
    this.articulo.patchValue(art.articulo);
  }

  filtrarMedidas = (value: string): Medida[] => {
    if (value && (typeof value === 'string') && value !== '') {
      const filtro = value.toLowerCase();
      return this.medidas.filter(m => m.descripcion.toLowerCase().includes(filtro));
    } else {
      return this.medidas;
    }
  }

  medidaDisplay = (obj: Medida) => obj && obj.descripcion ? obj.descripcion : '';

  medidaSelectedEv = (obj: MatAutocompleteSelectedEvent) => {
    const m = obj.option.value as Medida;
    this.medida.patchValue(m.medida);
  }

  cancelar = () => {
    const confDialog = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Paso a paso: producto de un combo',
        'Esto finalizará la selección del producto sin haber terminado de responder las preguntas. ¿Desea continuar?',
        'Sí', 'No', {}, true
      )
    });

    this.endSubs.add(
      confDialog.afterClosed().subscribe(respuesta => {
        if (respuesta?.resultado) {
          this.dialogWizRef.close(null);
        }
      })
    );
  };

  agregarProducto = () => {    
    this.precio_extra.patchValue(+this.precio.value > 0 ? 1 : 0);

    if (+this.articulo.value > 0) {
      const artTmp = this.articulos.find(a => +a.articulo === +this.articulo.value);
      if (artTmp) {
        this.filtroArticulo.patchValue(artTmp);
      }
    } else {
      this.snackbar.open('Parece que el producto no está en el listado. ¿Podría seleccionar uno del listado, por favor?', 'Paso a paso: combo', { duration: 7000 });
      return;
    }

    if (+this.medida.value > 0) {
      const medTmp = this.medidas.find(m => +m.medida === +this.medida.value);
      if (medTmp) {
        this.filtroMedida.patchValue(medTmp);
      }
    } else {
      this.snackbar.open('Parece que la unidad de medida no está en el listado. ¿Podría seleccionar una del listado, por favor?', 'Paso a paso: combo', { duration: 7000 });
      return;
    }

    this.dialogWizRef.close(this.productoFrmGrp.value);
  };

}
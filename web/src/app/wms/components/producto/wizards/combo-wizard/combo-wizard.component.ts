import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalstorageService } from '../../../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../../../shared/global';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


// import { Articulo } from '../../../../interfaces/articulo';
import { CategoriaGrupoResponse } from '../../../../interfaces/categoria-grupo';
import { ArticuloService } from '../../../../services/articulo.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-combo-wizard',
  templateUrl: './combo-wizard.component.html',
  styleUrls: ['./combo-wizard.component.css']
})
export class ComboWizardComponent implements OnInit, OnDestroy {

  get descripcionArticulo(): FormControl {
    return this.encabezadoHeadereFormGroup.get('descripcion') as FormControl;
  }

  get categoriaGrupoArticulo(): FormControl {
    return this.encabezadoHeadereFormGroup.get('categoria_grupo') as FormControl;
  }

  // public articulo: Articulo;
  public encabezadoHeadereFormGroup: FormGroup;
  public lstSubCategorias: CategoriaGrupoResponse[] = [];
  public lstSubCategoriasFiltered: Observable<CategoriaGrupoResponse[]>;
  // public secondFormGroup: FormGroup;

  private endSubs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private ls: LocalstorageService,
    private articuloSrvc: ArticuloService
  ) { }

  ngOnInit(): void {
    this.encabezadoHeadereFormGroup = this.fb.group({
      descripcion: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(250)]],
      categoria_grupo: [null, Validators.required]
    });
    // this.secondFormGroup = this.fb.group({
    //   secondCtrl: ['', Validators.required],
    // });
    this.loadSubCategorias();
    this.lstSubCategoriasFiltered = this.categoriaGrupoArticulo.valueChanges.pipe(
      startWith(''),
      map(value => this.filtrarSubCategorias(value))
    );
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadSubCategorias = () => {
    this.endSubs.add(
      this.articuloSrvc.getCategoriasGrupos({ _activos: true, _sede: this.ls.get(GLOBAL.usrTokenVar).sede }).subscribe(res => {
        this.lstSubCategorias = res.map(r => {
          r.categoria_grupo = +r.categoria_grupo;
          return r;
        });
      })
    );
  }

  private filtrarSubCategorias = (value: string): CategoriaGrupoResponse[] => {
    if (value && (typeof value === 'string')) {
      const filtro = value.toLowerCase();
      return this.lstSubCategorias.filter(sc => sc.descripcion.toLowerCase().includes(filtro));
    } else {
      return this.lstSubCategorias;
    }
  }

  subcategoriaDisplay = (sc: CategoriaGrupoResponse) => {
    return sc && sc.descripcion ? `${sc.descripcion} (${sc.categoria.descripcion})` : ''
  }

}

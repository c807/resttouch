import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { NotaPredefinida } from '@restaurante-interfaces/nota-predefinida';
import { NotaPredefinidaService } from '@restaurante-services/nota-predefinida.service';
import { NotaSubCategoria, NotaSubCategoriaReq } from '@restaurante-interfaces/nota-subcategoria';

import { Subscription } from 'rxjs';
import { CategoriaGrupo } from '@wms-interfaces/categoria-grupo';
import { Categoria } from '@wms-interfaces/categoria';
import { ArticuloService } from '@wms-services/articulo.service';
import { NotaSubCategoriaService } from '@restaurante-services/nota-subcategoria.service';

@Component({
  selector: 'app-form-nota-predefinida',
  templateUrl: './form-nota-predefinida.component.html',
  styleUrls: ['./form-nota-predefinida.component.css']
})
export class FormNotaPredefinidaComponent implements OnInit, OnDestroy {

  @Input() notaPredefinida: NotaPredefinida;
  @Output() notaPredefinidaSavedEv = new EventEmitter();  
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  @Input() notaSubcat: NotaSubCategoria;

  @Input() notaSubCategoriaReq: NotaSubCategoriaReq;
  public categorias: Categoria[] = []; 
  public categoriasMarcadas: number[] = [];
  public lstSubCat: NotaSubCategoria[] = [];
  private endSubs = new Subscription();
  appLstProdAlt: any;
  bloqueoBotones: boolean;

  constructor(
    private snackBar: MatSnackBar,
    private notaPredefinidaSrvc: NotaPredefinidaService,
    private ls: LocalstorageService,
    private articuloSrvc: ArticuloService,
    private notaSubCategoriaSrvc: NotaSubCategoriaService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadCategorias();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();    
  }

  resetNotaPredefinida() {
    this.notaPredefinida = { nota_predefinida: null, nota: null };    
  }

  onSubmit() {
    this.endSubs.add(      
      this.notaPredefinidaSrvc.save(this.notaPredefinida).subscribe((res) => {
        if (res) {
          this.resetNotaPredefinida();
          this.notaPredefinidaSavedEv.emit();
          this.snackBar.open('Grabada con éxito.', 'Nota predefinida', { duration: 5000 });
        }
      })
    );
  }

  loadCategorias = () => {
    this.endSubs.add(
      this.articuloSrvc.getCategorias({ sede: (+this.ls.get(GLOBAL.usrTokenVar).sede || 0), _activos: true, _ver_pos: true }).subscribe((res: Categoria[]) => {
        this.categorias = res;

        if (this.categorias) {
          this.categorias.forEach(cat => {
            this.loadSubCategorias(cat.categoria)
          })
        }
      })
    );
  }

  loadSubCategorias = (idcategoria: number) => {
    this.endSubs.add(      
      this.articuloSrvc.getCategoriasGrupos({ categoria: +idcategoria, _activos: true }).subscribe(res => {
        const categoriasGruposPadre = this.articuloSrvc.adaptCategoriaGrupoResponse(res);
        let item = this.categorias.find(cat => cat.categoria == idcategoria)
        item.grupos = JSON.parse(JSON.stringify(categoriasGruposPadre));
        if (item.grupos) {
          item.grupos.forEach(g => {g._marcado = false})
        }
      })
    );
  }

  onSubmitCategoria() {
    this.notaSubCategoriaReq = {
      nota: +this.notaPredefinida.nota_predefinida,
      grupos: []
    }
  
    this.categorias.forEach(cat => {
      cat.grupos.forEach(g => {
        if (g._marcado) {
          this.notaSubCategoriaReq.grupos.push(g.categoria_grupo)
        }
      })
    })
  
    this.endSubs.add(      
      this.notaSubCategoriaSrvc.save(this.notaSubCategoriaReq).subscribe((res) => {
        if (res) {
          this.resetNotaPredefinida();
          this.snackBar.open('Grupos guardados correctamente.', 'Grupos', { duration: 5000 });
        }
      })
    );
  }
  

  checkTodos(marcado, categoria) {
    const cat = this.categorias.find(c => c.categoria == categoria)

    if (cat && cat.grupos) {
      cat.grupos.forEach(g => {
        const grupoClonado = JSON.parse(JSON.stringify(g));
        grupoClonado._marcado = marcado;

        const indice = cat.grupos.indexOf(g);
        cat.grupos[indice] = grupoClonado;
      })
    }
  }

  marcarChecks(marcados:number[] = []) {
    this.categorias.forEach(cat => {
      cat.grupos.forEach(g => {
        const grupoClonado = JSON.parse(JSON.stringify(g));
        grupoClonado._marcado = marcados.includes(g.categoria_grupo);
        
        const indice = cat.grupos.indexOf(g);
        cat.grupos[indice] = grupoClonado;
      })
    })
  }

  cargarNsubcat(nota: number) {
    this.endSubs.add(
      this.notaSubCategoriaSrvc.get({nota_predefinida: nota}).subscribe(lst => {
        this.lstSubCat = lst;
        const aux = this.lstSubCat.map(i => +i.categoria_grupo)
        this.marcarChecks(aux)
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.notaPredefinida) {
      const nv = changes.notaPredefinida.currentValue;
      this.lstSubCat = []
      if (nv.nota_predefinida) {
        this.cargarNsubcat(nv.nota_predefinida)
      } else {
        this.marcarChecks()
      }
    }
  }

}

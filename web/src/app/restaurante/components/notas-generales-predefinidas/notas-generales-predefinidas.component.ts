import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { NotaPredefinidaService } from '@restaurante-services/nota-predefinida.service';

import { NotaPredefinida } from '@restaurante-interfaces/nota-predefinida';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { NotaSubCategoriaService } from '@restaurante-services/nota-subcategoria.service';
import { NotaSubCategoria, NotaSubCategoriaReq } from '@restaurante-interfaces/nota-subcategoria';

interface IDatosNotas {
  titulo: string;
  notas_predefinidas: string;
  categoria_grupo: number;
}

@Component({
  selector: 'app-notas-generales-predefinidas',
  templateUrl: './notas-generales-predefinidas.component.html',
  styleUrls: ['./notas-generales-predefinidas.component.css']
})
export class NotasGeneralesPredefinidasComponent implements OnInit, OnDestroy {

  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public lstNotasPredefinidas: NotaPredefinida[] = [];
  public todasNotasPredefinidas: NotaPredefinida[] = [];
  public txtNotasPre = new FormControl();
  public notasSeleccionadas: {[nota: string]: boolean} = {};
  public lstNotaSubCategoria: NotaSubCategoria[] = [];

  private endSubs = new Subscription();
  
  constructor(
    public dialogRef: MatDialogRef<NotasGeneralesPredefinidasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDatosNotas,
    private ls: LocalstorageService,
    private notaPredefinidaSrvc: NotaPredefinidaService,
    private notaSubCategoriaSrvc: NotaSubCategoriaService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadNotasPredefinidas();

    if (this.data.notas_predefinidas !== null && this.data.notas_predefinidas !== undefined) {
      if (this.data.notas_predefinidas.trim() !== '') {
        this.txtNotasPre.setValue(this.data.notas_predefinidas.trim());
      }
    }

    if (this.data.notas_predefinidas) {
      const notas = this.data.notas_predefinidas.split(' | ');
      notas.forEach(nota => {
        this.notasSeleccionadas[nota] = true;
      });
    }

  }

  toggleNota(nota: string) {
    this.notasSeleccionadas[nota] = !this.notasSeleccionadas[nota];
    const notasSeleccionadas = Object.keys(this.notasSeleccionadas).filter(nota => this.notasSeleccionadas[nota]);
    this.txtNotasPre.setValue(notasSeleccionadas.join(' | '));
}

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  terminar = () => {
    const laNotaPre = (this.txtNotasPre.value as string) || null;
    this.dialogRef.close(laNotaPre)
  };

  loadNotasPredefinidas = () => this.endSubs.add(this.notaPredefinidaSrvc.get().subscribe(res => {
    for(const n of res) {
      this.todasNotasPredefinidas.push(n);
    }

    this.loadNotaSubCategoria()

  }));

  loadNotaSubCategoria = () => this.endSubs.add(this.notaSubCategoriaSrvc.get({categoria_grupo: this.data.categoria_grupo }).subscribe(res => {
    const notas = res.map(i => i.nota_predefinida)

    this.lstNotasPredefinidas = this.todasNotasPredefinidas.filter(n => notas.includes(n.nota_predefinida))
  }));

}
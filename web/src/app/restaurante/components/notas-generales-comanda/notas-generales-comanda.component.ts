import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { NotaPredefinidaService } from '@restaurante-services/nota-predefinida.service';

import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface IDatosNotas {
  titulo: string;
  notasGenerales: string;
}

@Component({
  selector: 'app-notas-generales-comanda',
  templateUrl: './notas-generales-comanda.component.html',
  styleUrls: ['./notas-generales-comanda.component.css']
})
export class NotasGeneralesComandaComponent implements OnInit, OnDestroy {

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.lstNotasPredefinidas.filter(opt => opt.toLowerCase().includes(filterValue));
  }

  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public lstNotasPredefinidas: string[] = [];
  public txtNotas = new FormControl();
  public filteredLstNotasPredefinidas: Observable<string[]>;

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<NotasGeneralesComandaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDatosNotas,
    private ls: LocalstorageService,
    private notaPredefinidaSrvc: NotaPredefinidaService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadNotasPredefinidas();

    this.filteredLstNotasPredefinidas = this.txtNotas.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );

    if (this.data.notasGenerales !== null && this.data.notasGenerales !== undefined) {
      if (this.data.notasGenerales.trim() !== '') {
        this.txtNotas.setValue(this.data.notasGenerales.trim());
      }
    }

  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  terminar = () => {
    const laNota = (this.txtNotas.value as string) || null;
    this.dialogRef.close(laNota)
  };

  loadNotasPredefinidas = () => this.endSubs.add(this.notaPredefinidaSrvc.get().subscribe(res => {
    for(const n of res) {
      this.lstNotasPredefinidas.push(n.nota);
    }
  }));

}

import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GLOBAL } from '../../global';
import { LocalstorageService } from '../../../admin/services/localstorage.service';

import { ArticuloResponse } from '../../../wms/interfaces/articulo';
import { ArticuloService } from '../../../wms/services/articulo.service';

import { Subscription } from 'rxjs';

interface IExtra {
  articulo: ArticuloResponse
}

@Component({
  selector: 'app-extra-producto',
  templateUrl: './extra-producto.component.html',
  styleUrls: ['./extra-producto.component.css']
})
export class ExtraProductoComponent implements OnInit, OnDestroy {

  public articulosExtras: ArticuloResponse[] = [];
  public extra: IExtra = {
    articulo: null
  };
  public extras: any = [];

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<ExtraProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private articuloSrc: ArticuloService ,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.loadArticulosExtras();
    if (this.data.extras) {
      // console.log(this.data.extras);
      this.extras = JSON.parse(JSON.stringify(this.data.extras));
    }
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadArticulosExtras = () => {
    this.endSubs.add(
      this.articuloSrc.getArticulo({esextra: 1, debaja: 0, _sede: this.ls.get(GLOBAL.usrTokenVar).sede}).subscribe(res => this.articulosExtras = res)
    );
  }

  terminar = () => this.dialogRef.close(this.extras);

  addExtra = () => {
    if (this.extra.articulo) {
      this.extras.push({
        articulo: this.extra.articulo.articulo,
        descripcion: this.extra.articulo.descripcion,
        precio: this.extra.articulo.precio,
      });
      this.extra = {
        articulo: null
      };
    }
  }

  quitarExtra = (index: number) => {
    this.extras.splice(index, 1);
  }

}

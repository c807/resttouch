import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ArticuloService } from '../../../wms/services/articulo.service'

export class ConfirmDialogComboModel {
  constructor(
    public producto: any,
    public lblBtnConfirm: string,
    public lblBtnDeny: string
  ) { }
}

@Component({
  selector: 'app-dialog-combo',
  templateUrl: './dialog-combo.component.html',
  styleUrls: ['./dialog-combo.component.css']
})
export class DialogComboComponent implements OnInit {

  public title: string;
  public message: string;
  public lblBtnConfirm: string;
  public lblBtnDeny: string;
  public datos: any;
  public producto: any;
  public combo: any;
  public seleccion: any;

  constructor(
    public dialogRef: MatDialogRef<DialogComboComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogComboModel,
    private articuloSvr: ArticuloService
  ) {
    this.datos = {
      respuesta: false,
      seleccion: []
    };
    this.lblBtnConfirm = data.lblBtnConfirm;
    this.lblBtnDeny = data.lblBtnDeny;
    this.producto = data.producto;
    this.seleccion = {
      articulo: this.producto.id,
      descripcion: this.producto.nombre,
      receta: []
    };
  }

  ngOnInit() {
    this.combo = [];
    this.getArticulos();
  }

  getArticulos = () => {
    const fltr: any = { articulo: this.producto.id };
    this.articuloSvr.getArticuloCombo(fltr).subscribe((res) => {
      let multiple = 0;
      this.combo = res;
      for (let i = 0; i < this.combo.receta.length; i++) {

        const element = this.combo.receta[i];

        this.combo.receta[i].seleccionado = false;
        if (+element.multiple === 1) {
          multiple++;
          const list = [];
          for (let cont = 0; cont < +this.combo.receta[i].cantidad_maxima; cont++) {
            list.push({
              id: cont,
              seleccion: {}
            });
          }
          this.combo.receta[i].input = list;
        } else {
          this.seleccion.receta.push(this.combo.receta[i]);
        }
      }

      if (+multiple === 0) {
        this.onConfirm();
      }
    });
  }

  onConfirm(): void {

    const multi = this.combo.receta.filter(p => +p.multiple === 1);
    // console.log(multi);
    for (let i = 0; i < multi.length; i++) {
      const element = multi[i];
      this.seleccion.receta.push({
        articulo: element.articulo,
        descripcion: element.descripcion,
        receta: []
      });
      const idx = this.seleccion.receta.findIndex(p => +p.articulo === +element.articulo);
      for (let j = 0; j < element.input.length; j++) {
        const prod = element.input[j].seleccion;
        this.seleccion.receta[idx].receta.push(prod);
      }
    }
    this.datos.respuesta = true;
    this.datos.seleccion = this.seleccion;
    this.dialogRef.close(this.datos);
  }

  onDismiss(): void {
    this.datos.respuesta = false;
    this.dialogRef.close(this.datos);
  }

}


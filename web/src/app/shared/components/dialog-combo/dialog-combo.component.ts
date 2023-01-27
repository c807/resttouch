import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL } from '@shared/global';

import { ArticuloService } from '@wms-services/articulo.service';
import { ExtraProductoComponent } from '@shared-components/extra-producto/extra-producto.component';

import { Subscription } from 'rxjs';

export class ConfirmDialogComboModel {
  constructor(
    public producto: any,
    public lblBtnConfirm: string,
    public lblBtnDeny: string,
    public sinInputCantidad?: boolean
  ) { }
}

@Component({
  selector: 'app-dialog-combo',
  templateUrl: './dialog-combo.component.html',
  styleUrls: ['./dialog-combo.component.css']
})
export class DialogComboComponent implements OnInit, OnDestroy {

  public title: string;
  public message: string;
  public lblBtnConfirm: string;
  public lblBtnDeny: string;
  public datos: any;
  public producto: any;
  public combo: any;
  public seleccion: any;
  public esMovil = false;
  public keyboardLayout: string;

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<DialogComboComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogComboModel,
    private articuloSvr: ArticuloService,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    public dialog: MatDialog
  ) {
    this.datos = {
      respuesta: false,
      seleccion: []
    };
    this.lblBtnConfirm = data.lblBtnConfirm;
    this.lblBtnDeny = data.lblBtnDeny;
    this.producto = data.producto;
    this.seleccion = {
      cantidad: 1,
      articulo: this.producto.id,
      descripcion: this.producto.nombre,
      receta: []
    };
  }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.keyboardLayout = GLOBAL.IDIOMA_TECLADO;
    this.combo = [];
    this.getArticulos();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  getArticulos = () => {
    const fltr: any = { articulo: this.producto.id, debaja: 0 };
    this.endSubs.add(      
      this.articuloSvr.getArticuloCombo(fltr).subscribe((res) => {
        let multiple = 0;
        this.combo = res;
        for (let i = 0; i < this.combo.receta.length; i++) {
          this.combo.receta[i].idx = i;
  
          const element = this.combo.receta[i];
  
          this.combo.receta[i].seleccionado = false;
          if (+element.multiple === 1) {
            multiple++;
            const list = [];
            for (let cont = 0; cont < +this.combo.receta[i].cantidad_maxima; cont++) {
              list.push({
                id: cont,
                seleccion: {
                  extras: []
                }
              });
            }
            this.combo.receta[i].input = list;
          } else {
            this.seleccion.receta.push(this.combo.receta[i]);
          }
        }
  
        // if (+multiple === 0) { this.onConfirm(); } // Se quitó esta validación para poder modificar la cantidad de los combos fijos.
      })
    );
  }

  setCantidad = () => {
    let cantidad = 0;
    if (this.seleccion.cantidad) {
      cantidad = this.seleccion.cantidad;
    }

    for (let i = 0; i < this.combo.receta.length; i++) {

      const element = this.combo.receta[i];

      if (+element.multiple === 1) {
        const list = [];
        for (let cont = 0; cont < +this.combo.receta[i].cantidad_maxima * this.seleccion.cantidad; cont++) {
          list.push({
            id: cont,
            seleccion: {}
          });
        }
        this.combo.receta[i].input = list;
      }
    }
  }

  onConfirm(): void {
    const multi = this.combo.receta.filter(p => +p.multiple === 1);
    const vanTodos = this.todosSeleccionados(multi);
    if (vanTodos) {
      for (const element of multi) {
        this.seleccion.receta.push({
          articulo: element.articulo,
          descripcion: element.descripcion,
          receta: []
        });
        const idx = this.seleccion.receta.findIndex(p => +p.articulo === +element.articulo);
        for (const inp of element.input) {
          const prod = inp.seleccion;
          this.seleccion.receta[idx].receta.push(prod);
        }
      }      
      this.datos.respuesta = true;
      this.datos.seleccion = this.seleccion;
      this.dialogRef.close(this.datos);
    } else {
      this.snackBar.open('Por favor seleccione todas las opciones para completar.', 'Combos', { duration: 7000 });
    }
  }

  todosSeleccionados = (multi: any[]): boolean => {
    let vanTodos = true;

    Loop1:
    for (const element of multi) {
      for (const inp of element.input) {
        if (inp.seleccion.articulo === undefined) {
          vanTodos = false;
          break Loop1;
        }
      }
    }

    return vanTodos;
  }

  onDismiss(): void {
    this.datos.respuesta = false;
    this.dialogRef.close(this.datos);
  }

  seleccionarExtra = (i: number, j: number) => {
    // console.log(`RECETA (${i}) = `, this.combo.receta[i]);
    // console.log(`INPUT (${i}, ${j}) = `, this.combo.receta[i].input[j]);
    let sel = this.combo.receta[i].input[j].seleccion;    
    // console.log('EXTRAS = ', sel.extras);
    const extrasRef = this.dialog.open(ExtraProductoComponent, {
      maxWidth: '40vw', width: '40vw',
      data: { extras: sel.extras || [] }
    });

    this.endSubs.add(
      extrasRef.afterClosed().subscribe(resExt => {
        // console.log(`INPUT (${i}, ${j}) = `, this.combo.receta[i].input[j]);
        this.combo.receta[i].input[j].seleccion.extras = resExt || [];
        sel = null;
      })
    );
  }

}


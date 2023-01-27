import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Comanda, ComandaGetResponse } from '@restaurante-interfaces/comanda';
import { ProductoSelected } from '@wms-interfaces/articulo';

import { ComandaService } from '@restaurante-services/comanda.service';

import { Subscription } from 'rxjs';

interface IDialogComanda {
  mesaEnUso: ComandaGetResponse;
  lstProductos: ProductoSelected[];
}

@Component({
  selector: 'app-distribuir-productos-cuentas',
  templateUrl: './distribuir-productos-cuentas.component.html',
  styleUrls: ['./distribuir-productos-cuentas.component.css']
})
export class DistribuirProductosCuentasComponent implements OnInit, OnDestroy {

  public comanda: Comanda;
  public cantidadProducto: number[] = [];
  public cpLstProductos: ProductoSelected[] = [];
  public compLstProductos: ProductoSelected[] = [];

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<DistribuirProductosCuentasComponent>,
    private snackBar: MatSnackBar,
    private comandaSrvc: ComandaService,
    @Inject(MAT_DIALOG_DATA) public data: IDialogComanda
  ) { }

  ngOnInit() {
    if (+this.data.mesaEnUso.comanda > 0) {
      const meu = this.data.mesaEnUso;
      this.comanda = {
        area: +meu.mesa.area.area,
        mesa: +meu.mesa.mesa,
        mesero: +meu.mesero.usuario,
        comensales: meu.cuentas.length + 1,
        dividirCuentasPorSillas: 1,
        comanda: +meu.comanda,
        cuentas: meu.cuentas,
        replaceUnica: false
      };
    }

    this.cpLstProductos = [];

    if (this.data.lstProductos.length > 0) {
      // console.log(this.data.lstProductos);
      // console.log(this.data.mesaEnUso.cuentas);
      this.data.lstProductos.forEach(item => {
        const laCta = this.data.mesaEnUso.cuentas.find(c => +c.cuenta === +item.idcuenta);
        if (+laCta.cerrada === 0) {
          this.cpLstProductos.push(item);
          this.cantidadProducto.push(+item.cantidad);
        }
      });
      this.cpLstProductos = JSON.parse(JSON.stringify(this.cpLstProductos));
      this.compLstProductos = JSON.parse(JSON.stringify(this.cpLstProductos));
    }
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe()
  }

  cancelar = () => this.dialogRef.close(false);

  guardar = () => {
    const lstObj: any[] = [];
    let idx = 0;
    for (const p of this.cpLstProductos) {
      if (+p.idcuenta !== +this.compLstProductos[idx].idcuenta) {
        lstObj.push({
          detalle_comanda: +p.detalle_comanda,
          cuenta: +p.idcuenta,
          cantidad: +p.cantidad
        });
      }
      idx++;
    }
    if (lstObj.length > 0) {
      this.endSubs.add(        
        this.comandaSrvc.distribuirCuentas(lstObj).subscribe(res => {
          if (res.exito) {
            this.snackBar.open('Productos redistribuidos', 'Cuentas', { duration: 3000 });
            this.dialogRef.close(true);
          } else {
            this.snackBar.open(`ERROR: ${res.mensaje}`, 'Cuentas', { duration: 7000 });
            this.cancelar();
          }
        })
      );
    } else {
      this.snackBar.open('Sin cambios en las cuentas.', 'Cuentas', { duration: 7000 });
      this.dialogRef.close(true);
    }
  }
}

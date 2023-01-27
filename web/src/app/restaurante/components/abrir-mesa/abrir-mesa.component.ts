import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL } from '@shared/global';

import { PideDatosCuentasComponent } from '@restaurante-components/pide-datos-cuentas/pide-datos-cuentas.component';
import { Cuenta } from '@restaurante-interfaces/cuenta';
import { Comanda } from '@restaurante-interfaces/comanda';
import { Usuario } from '@admin-models/usuario';
import { UsuarioService } from '@admin-services/usuario.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-abrir-mesa',
  templateUrl: './abrir-mesa.component.html',
  styleUrls: ['./abrir-mesa.component.css']
})
export class AbrirMesaComponent implements OnInit, OnDestroy {

  public lstMeseros: Usuario[] = [];
  public esMovil = false;
  public keyboardLayout: string;

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<AbrirMesaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Comanda,
    public dialogDatosCuentas: MatDialog,
    public usuarioSrvc: UsuarioService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.keyboardLayout = GLOBAL.IDIOMA_TECLADO;
    this.loadMeseros();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadMeseros = () => {
    this.endSubs.add(      
      this.usuarioSrvc.getMeserosTurno().subscribe(res => {
        this.lstMeseros = res || [];
      })
    );
  }

  pedirDatosDeCuentas(obj: Comanda) {

    const pideDatosCuentasRef = this.dialogDatosCuentas.open(PideDatosCuentasComponent, {
      width: '50%',
      disableClose: true,
      data: { cuentas: obj.cuentas, comensales: this.data.comensales }
    });

    this.endSubs.add(
      pideDatosCuentasRef.afterClosed().subscribe((result: Cuenta[]) => {
        obj.cuentas = result;
        this.dialogRef.close(obj);
      })
    );

  }

  terminar(obj: Comanda = null) {
    if (!obj) {
      this.dialogRef.close();
    } else {
      if (!obj.dividirCuentasPorSillas) {
        this.dialogRef.close(obj);
      } else {
        this.pedirDatosDeCuentas(obj);
      }
    }
  }

  toNumber = (valor: any): number => +valor;

}

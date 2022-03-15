import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { ClienteMaster, ClienteMasterDireccion } from '../../../interfaces/cliente-master';
import { ClienteMasterService } from '../../../services/cliente-master.service';

import { Subscription } from 'rxjs';
import { TipoDireccionService } from '../../../services/tipo-direccion.service';
import { TipoDireccion } from '../../../interfaces/tipo-direccion';
import { SedeService } from "../../../../admin/services/sede.service";
import { Sede } from "../../../../admin/interfaces/sede";

@Component({
  selector: 'app-agrega-direccion',
  templateUrl: './agrega-direccion.component.html',
  styleUrls: ['./agrega-direccion.component.css']
})

export class AgregaDireccionComponent implements OnInit, OnDestroy {

  @Input() clienteMaster: ClienteMaster;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  public nombre: string;
  public direccion: ClienteMasterDireccion;
  public tipoDireccion: TipoDireccion[] = [];

  public sedes: Sede[] = [];
  public isEditing = false;

  private endSubs = new Subscription();

  constructor(
    private tipoDireccionSrvc: TipoDireccionService,
    public dialogRef: MatDialogRef<AgregaDireccionComponent>,
    private clienteMasterSrvc: ClienteMasterService,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private sedeSrvc: SedeService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  ngOnInit(): void {
    this.loadSedes();
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.isEditing = this.data.isEditing;
    if (this.data.defData) {
      this.direccion = this.data.defData;
    } else {
      this.direccion = {
        cliente_master_direccion: null,
        cliente_master: this.data.clienteMaster.cliente_master,
        tipo_direccion: null,
        direccion1: null,
        debaja: 0,
        pais: 'Guatemala'
      };
    }

    this.nombre = this.data.clienteMaster.nombre;

    // Carga tipos de direccion
    this.tipoDireccionSrvc.get().subscribe(lst => {
      this.tipoDireccion = lst;
    });
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadSedes = () => {
    this.endSubs.add(
      this.sedeSrvc.get().subscribe(res => this.sedes = res)
    );
  }

  cancelar = () => {
    this.dialogRef.close();
  }

  onDireccionSubmit = () => {
    this.endSubs.add(
      this.clienteMasterSrvc.saveDireccionClienteMaster(this.direccion).subscribe(res => {
        if (res.exito) {
          if (this.data.returnNewAddress && res.cliente_master_direccion) {
            this.dialogRef.close(res.cliente_master_direccion);
          } else {
            this.dialogRef.close();
          }
          this.snackBar.open(res.mensaje, 'Direccion asociada', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Error al agregar direccion', { duration: 7000 });
        }
      })
    );
  }
}

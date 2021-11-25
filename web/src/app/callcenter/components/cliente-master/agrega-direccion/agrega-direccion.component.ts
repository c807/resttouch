import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {GLOBAL} from '../../../../shared/global';
import {LocalstorageService} from '../../../../admin/services/localstorage.service';

import {ClienteMaster} from '../../../interfaces/cliente-master';
import {ClienteMasterService} from '../../../services/cliente-master.service';

import {Subscription} from 'rxjs';
import {ConfiguracionService} from '../../../../admin/services/configuracion.service';
import {TipoDireccionService} from '../../../services/tipo-direccion.service';

@Component({
  selector: 'app-agrega-direccion',
  templateUrl: './agrega-direccion.component.html',
  styleUrls: ['./agrega-direccion.component.css']
})

export class AgregaDireccionComponent implements OnInit, OnDestroy {

  @Input() clienteMaster: ClienteMaster;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  public nombre: any = {};
  public direccion: any = {};
  public tipoDireccion: any = {};

  public isEditing = false;

  private endSubs = new Subscription();

  constructor(
    private tipoDireccionSrvc: TipoDireccionService,
    public dialogRef: MatDialogRef<AgregaDireccionComponent>,
    private clienteMasterSrvc: ClienteMasterService,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private configSrvc: ConfiguracionService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }


  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.tipoDireccion = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_PORCENTAJE_MAXIMO_PROPINA);
    this.isEditing = this.data.isEditing;
    if (this.data.defData) {
      this.direccion = this.data.defData;
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

  cancelar = () => this.dialogRef.close();

  onDireccionSubmit = () => {
    const obj = {
      cliente_master: this.data.clienteMaster.cliente_master,
      tipo_direccion: this.direccion.tipo_direccion,
      direccion1: this.direccion.direccion1,
      direccion2: this.direccion.direccion2,
      zona: this.direccion.zona,
      codigo_postal: this.direccion.codigo_postal,
      municipio: this.direccion.municipio,
      departamento: this.direccion.departamento,
      pais: this.direccion.pais,
      notas: this.direccion.notas,
      debaja: 0,
      cliente_master_direccion: this.direccion.cliente_master_direccion
    }

    this.endSubs.add(
      this.clienteMasterSrvc.saveDireccionClienteMaster(obj).subscribe(res => {
        if (res.exito) {
          this.dialogRef.close();
          this.snackBar.open(res.mensaje, 'Direccion asociada', {duration: 3000});
        } else {
          console.log(`ERROR: ${res.mensaje}`, 'Error al agregar direccion)');
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Error al agregar direccion', {duration: 7000});
        }
      })
    );
  }
}

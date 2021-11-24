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

  public direccion: any = {};
  public tipoDireccion: any = {};

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
      tipo_direccion: 1,
      direccion1: this.direccion.dir_one,
      direccion2: this.direccion.dir_two,
      zona: this.direccion.zona,
      codigo_postal: this.direccion.codigo_postal,
      municipio: this.direccion.municipio,
      departamento: this.direccion.departamento,
      pais: this.direccion.pais,
      notas: this.direccion.notas,
      debaja: 1
    }

    this.endSubs.add(
      this.clienteMasterSrvc.saveDireccionClienteMaster(obj).subscribe(res => {
        if (res.exito) {
          this.snackBar.open(res.mensaje, 'Direccion asociada', {duration: 3000});
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Direccion asociada', {duration: 7000});
        }
      })
    );
  }
}

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {GLOBAL} from '../../../../shared/global';
import {LocalstorageService} from '../../../../admin/services/localstorage.service';

import {
  ClienteMaster,
  ClienteMasterDireccion,
  ClienteMasterDireccionResponse
} from '../../../interfaces/cliente-master';
import {ClienteMasterService} from '../../../services/cliente-master.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import {Subscription} from 'rxjs';
import {AgregaDireccionComponent} from '../agrega-direccion/agrega-direccion.component';

@Component({
  selector: 'app-cliente-master-direccion',
  templateUrl: './cliente-master-direccion.component.html',
  styleUrls: ['./cliente-master-direccion.component.css']
})
export class ClienteMasterDireccionComponent implements OnInit, OnDestroy {

  @Input() clienteMaster: ClienteMaster;
  public cmDireccion: ClienteMasterDireccion;
  public lstDirecciones: ClienteMasterDireccionResponse[] = [];
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    private clienteMasterSrvc: ClienteMasterService,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
  ) {
  }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    if (+this.clienteMaster.cliente_master > 0) {
      this.loadDirecciones();
    }
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadDirecciones = () => {
    this.cargando = true;
    this.endSubs.add(
      this.clienteMasterSrvc.buscarDireccion({cliente_master: this.clienteMaster.cliente_master}).subscribe(res => {
        this.lstDirecciones = res;
        this.cargando = false;
      })
    );
  }

  agregarDireccion = () => {
    const cmdRef = this.dialog.open(AgregaDireccionComponent, {
      maxWidth: '90vw', maxHeight: '75vh', width: '99vw', height: '85vh',
      disableClose: true,
      data: {clienteMaster: this.clienteMaster, isEditing: false}
    });
    cmdRef.afterClosed().subscribe(() => {
      // Do stuff after the dialog has closed
      this.loadDirecciones();
    });
  }

  editarDireccion = (direccion: ClienteMasterDireccionResponse) => {
    this.cargando = true;
    this.cmDireccion = {
      cliente_master_direccion: direccion.cliente_master_direccion,
      cliente_master: direccion.cliente_master.cliente_master,
      tipo_direccion: direccion.tipo_direccion.tipo_direccion,
      direccion1: direccion.direccion1,
      direccion2: direccion.direccion2,
      zona: direccion.zona,
      codigo_postal: direccion.codigo_postal,
      municipio: direccion.municipio,
      departamento: direccion.departamento,
      pais: direccion.pais,
      notas: direccion.notas,
      debaja: direccion.debaja
    };

    const cmdRef = this.dialog.open(AgregaDireccionComponent, {
      maxWidth: '90vw', maxHeight: '75vh', width: '99vw', height: '85vh',
      disableClose: true,

      data: {clienteMaster: this.clienteMaster, isEditing: true, defData: this.cmDireccion}
    });

    cmdRef.afterClosed().subscribe(() => {
      // Do stuff after the dialog has closed
      this.loadDirecciones();
    });

  }

  darDeBaja = (direccion: ClienteMasterDireccionResponse) => {


    this.endSubs.add(
      this.clienteMasterSrvc.desasociarClienteMasterDireccion(direccion.cliente_master_direccion).subscribe(res => {
        if (res.exito) {
          this.snackBar.open(res.mensaje, 'Direccion desasociada', {duration: 3000});
          this.loadDirecciones();
        } else {
          console.log(`ERROR: ${res.mensaje}`, 'Error al dar debaja la direccion)');
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Error al dar debaja la direccion', {duration: 7000});
        }
      })
    );
  }

  /**
   * This unsubscribed addresses
   */


  eliminarDireccion = (direccion: ClienteMasterDireccionResponse) => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Eliminar dirección',
        `Esto eliminará la dirección de ${direccion.tipo_direccion.descripcion} de ${direccion.cliente_master.nombre}. ¿Desea continuar?`,
        'Sí',
        'No'
      )
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          this.darDeBaja(direccion);
        }
      })
    );
  }

}

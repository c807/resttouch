import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {GLOBAL} from '../../../../shared/global';
import {LocalstorageService} from '../../../../admin/services/localstorage.service';

import {
  ClienteMaster,
  ClienteMasterDireccion,
  ClienteMasterDireccionResponse, ClienteMasterNota, ClienteMasterNotaResponse
} from '../../../interfaces/cliente-master';
import {ClienteMasterService} from '../../../services/cliente-master.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import {Subscription} from 'rxjs';
import {AgregaDireccionComponent} from '../agrega-direccion/agrega-direccion.component';
import {AgregaNotaComponent} from '../agregar-nota/agrega-nota.component';

@Component({
  selector: 'app-cliente-master-nota',
  templateUrl: './cliente-master-nota.component.html',
  styleUrls: ['./cliente-master-nota.component.css']
})
export class ClienteMasterNotaComponent implements OnInit, OnDestroy {

  @Input() clienteMaster: ClienteMaster;
  public cmNota: ClienteMasterNota;
  public lstNota: ClienteMasterNotaResponse[] = [];
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
      this.loadNotas();
    }
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadNotas = () => {
    this.cargando = true;
    this.endSubs.add(
      this.clienteMasterSrvc.buscarNota({debaja: 0, cliente_master: this.clienteMaster.cliente_master }).subscribe(res => {
        this.lstNota = res;
        this.cargando = false;
      })
    );

  }

  agregarNota = () => {
    const cmdRef = this.dialog.open(AgregaNotaComponent, {
      maxWidth: '90vw', maxHeight: '75vh', width: '99vw', height: '85vh',
      disableClose: true,
      data: {clienteMaster: this.clienteMaster, isEditing: false}
    });
    cmdRef.afterClosed().subscribe(() => {
      // Do stuff after the dialog has closed
      this.loadNotas();
    });
  }

  editarNota = (nota: ClienteMasterNotaResponse) => {
    this.cargando = true;
    this.cmNota = {
      cliente_master_nota: nota.cliente_master_nota,
      nota: nota.nota,
      debaja: 0,
      fecha_hora: nota.fecha_hora,
      cliente_master: nota.cliente_master.cliente_master,
    };

    const cmdRef = this.dialog.open(AgregaNotaComponent, {
      maxWidth: '90vw', maxHeight: '75vh', width: '99vw', height: '85vh',
      disableClose: true,

      data: {clienteMaster: this.clienteMaster, isEditing: true, defData: this.cmNota}
    });

    cmdRef.afterClosed().subscribe(() => {
      // Do stuff after the dialog has closed
      this.loadNotas();
    });

  }

  darDeBaja = (nota: ClienteMasterNotaResponse) => {


    this.endSubs.add(
      this.clienteMasterSrvc.desasociarClienteMasterNota(nota.cliente_master_nota).subscribe(res => {
        if (res.exito) {
          this.snackBar.open(res.mensaje, 'Nota desasociada', {duration: 3000});
          this.loadNotas();
        } else {
          console.log(`ERROR: ${res.mensaje}`, 'Error al dar debaja la nota)');
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Error al dar debaja la nota', {duration: 7000});
        }
      })
    );
  }

  /**
   * This unsubscribed addresses
   */


  eliminarNota = (nota: ClienteMasterNotaResponse) => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Eliminar esta Nota',
        `Esto eliminará la nota  de ${nota.cliente_master.nombre}. ¿Desea continuar?`,
        'Sí',
        'No'
      )
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          this.darDeBaja(nota);
        }
      })
    );
  }

}

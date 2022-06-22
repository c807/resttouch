import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SolicitudRegistro } from '../../interfaces/solicitud-registro';
import { SolicitudRegistroService } from '../../services/solicitud-registro.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-solicitud-registro',
  templateUrl: './solicitud-registro.component.html',
  styleUrls: ['./solicitud-registro.component.css']
})
export class SolicitudRegistroComponent implements OnInit, OnDestroy {

  private endSubs = new Subscription();

  public solicitudRegistro: SolicitudRegistro = {
    solicitud_registro: null,
    corporacion: null,
    empresa: null,
    nit: null,
    direccion: null,
    pais: 'GT',
    departamento: 'Guatemala',
    municipio: 'Guatemala',
    codigo_postal: null,
    nombre: null,
    telefono: null,
    correo_electronico: null,
    procesada: 0
  };

  constructor(
    private solicitudRegistroSrvc: SolicitudRegistroService,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  doRegistro = () => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Solicitud de registro',
        '¿Está seguro(a) que sus datos son correctos?',
        'Sí', 'No'
      )
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.endSubs.add(
            this.solicitudRegistroSrvc.save(this.solicitudRegistro).subscribe(res => {
              this.snackBar.open(res.mensaje, 'Solicitud registrada', { duration: 5000 });
              this.router.navigate(['/admin/login']);
            })
          );        
        }
      })
    );
  }
}

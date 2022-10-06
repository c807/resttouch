import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import { SetupService } from '../../../services/setup.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-plantilla-datos',
  templateUrl: './plantilla-datos.component.html',
  styleUrls: ['./plantilla-datos.component.css']
})
export class PlantillaDatosComponent implements OnInit, OnDestroy {

  public cargando = false;
  public endSubs = new Subscription();

  myForm = new FormGroup({
    name: new FormControl('RT_PLANTILLA_DATOS', [Validators.required, Validators.minLength(3)]),
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required])
  });

  get f() {
    return this.myForm.controls;
  }

  constructor(
    private setupSrvc: SetupService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.myForm.patchValue({
        fileSource: file
      });
    }
  }

  submit() {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Subit plantilla de datos',
        'Este proceso intentará subir los datos del archivo y puede tardar un poco. ¿Desea continuar?', 'Sí', 'No'
      )
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          this.cargando = true;
          const formData = new FormData();
          formData.append('file', this.myForm.get('fileSource')?.value);

          this.endSubs.add(
            this.setupSrvc.subir_plantilla_datos(formData).subscribe(res => {
              this.snackBar.open(`${res.exito ? '' : 'ERROR: '}${res.mensaje}`, 'Subir plantilla', { duration: 7000 });
              this.myForm.reset();
              this.myForm.patchValue({ name: 'RT_PLANTILLA_DATOS' });
              this.cargando = false;
            })
          );
        }
      })
    );
  }
}

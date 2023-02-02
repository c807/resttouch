import { Component, OnInit, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { ComboWizardComponent } from '@wms-components/producto/wizards/combo/combo-wizard/combo-wizard.component'

import { Subscription } from 'rxjs';

interface IDialogWizard {
  wizard: number
}

@Component({
  selector: 'app-dialog-wizard',
  templateUrl: './dialog-wizard.component.html',
  styleUrls: ['./dialog-wizard.component.css']
})
export class DialogWizardComponent implements OnInit, OnDestroy {

  public tituloPasoAPaso: string = '';
  @ViewChild('wizCmb') wizCmb: ComboWizardComponent;

  private endSubs = new Subscription();

  constructor(
    public dialogWizRef: MatDialogRef<DialogWizardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogWizard,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.setTituloPasoAPaso();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  setTituloPasoAPaso = () => {
    switch (+this.data.wizard) {
      case 1: this.tituloPasoAPaso = 'combos'; break;
    }
  }

  cancelar = () => {
    const confDialog = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        `Paso a paso: ${this.tituloPasoAPaso}`,
        '¿Desea salir? (Si los pasos no están completos no guardará la información)',
        'Sí', 'No', {}, true
      )
    });

    this.endSubs.add(
      confDialog.afterClosed().subscribe(respuesta => {        
        if (respuesta.resultado) {
          this.dialogWizRef.close();
        }
      })
    );
  };

}

import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { TipoDomicilio } from '../../../interfaces/tipo-domicilio';
import { TipoDomicilioService } from '../../../services/tipo-domicilio.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-tipo-domicilio',
  templateUrl: './form-tipo-domicilio.component.html',
  styleUrls: ['./form-tipo-domicilio.component.css']
})
export class FormTipoDomicilioComponent implements OnInit, OnDestroy {

  @Input() tipoDomicilio: TipoDomicilio;
  @Output() tipoDomicilioSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private tipoDomicilioSrvc: TipoDomicilioService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetTipoDomicilio() {
    this.tipoDomicilio = { tipo_domicilio: null, descripcion: null };
  }

  onSubmit() {
    this.endSubs.add(      
      this.tipoDomicilioSrvc.save(this.tipoDomicilio).subscribe((res) => {
        if (res) {
          this.resetTipoDomicilio();
          this.tipoDomicilioSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Tipo de domicilio', { duration: 5000 });
        }
      })
    );
  }

}

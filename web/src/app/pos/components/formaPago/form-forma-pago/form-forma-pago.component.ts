import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '@admin/services/localstorage.service';
import { GLOBAL } from '@shared/global';

import { FormaPago } from '@pos-interfaces/forma-pago';
import { FormaPagoService } from '@pos-services/forma-pago.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-forma-pago',
  templateUrl: './form-forma-pago.component.html',
  styleUrls: ['./form-forma-pago.component.css']
})
export class FormFormaPagoComponent implements OnInit, OnDestroy {

  @Input() formaPago: FormaPago;
  @Output() formaPagoSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private formaPagoSrvc: FormaPagoService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetFormaPago = () => this.formaPago = { forma_pago: null, descripcion: null, activo: 1 };

  onSubmit = () => {
    this.endSubs.add(      
      this.formaPagoSrvc.save(this.formaPago).subscribe(res => {        
        if (res.exito) {
          this.formaPagoSavedEv.emit();
          this.resetFormaPago();
          this.snackBar.open('Forma de pago agregada...', 'Forma de pago', { duration: 3000 });
        }
      })
    );
  }
}

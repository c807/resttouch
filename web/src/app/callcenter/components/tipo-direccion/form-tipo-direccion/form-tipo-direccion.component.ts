import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { TipoDireccion } from '../../../interfaces/tipo-direccion';
import { TipoDireccionService } from '../../../services/tipo-direccion.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-tipo-direccion',
  templateUrl: './form-tipo-direccion.component.html',
  styleUrls: ['./form-tipo-direccion.component.css']
})
export class FormTipoDireccionComponent implements OnInit, OnDestroy {

  @Input() tipoDireccion: TipoDireccion;
  @Output() tipoDireccionSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private tipoDireccionSrvc: TipoDireccionService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetTipoDireccion() {
    this.tipoDireccion = { tipo_direccion: null, descripcion: null };
  }

  onSubmit() {
    this.endSubs.add(      
      this.tipoDireccionSrvc.save(this.tipoDireccion).subscribe((res) => {
        if (res.exito) {
          this.resetTipoDireccion();
          this.tipoDireccionSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Tipo de dirección', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Tipo de dirección', { duration: 7000 });
        }
      })
    );
  }  

}

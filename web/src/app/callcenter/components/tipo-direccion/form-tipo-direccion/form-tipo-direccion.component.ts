import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { TipoDireccion } from '../../../interfaces/tipo-direccion';
import { TipoDireccionService } from '../../../services/tipo-direccion.service';

@Component({
  selector: 'app-form-tipo-direccion',
  templateUrl: './form-tipo-direccion.component.html',
  styleUrls: ['./form-tipo-direccion.component.css']
})
export class FormTipoDireccionComponent implements OnInit {

  @Input() tipoDireccion: TipoDireccion;
  @Output() tipoDireccionSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  constructor(
    private snackBar: MatSnackBar,
    private tipoDireccionSrvc: TipoDireccionService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  resetTipoDireccion() {
    this.tipoDireccion = { tipo_direccion: null, descripcion: null };
  }

  onSubmit() {
    this.tipoDireccionSrvc.save(this.tipoDireccion).subscribe((res) => {
      if (res) {
        this.resetTipoDireccion();
        this.tipoDireccionSavedEv.emit();
        this.snackBar.open('Grabado con éxito.', 'Tipo de dirección', { duration: 5000 });
      }
    });
  }  

}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../services/localstorage.service';

import { MatSnackBar } from '@angular/material/snack-bar';

import { Impresora } from '../../../interfaces/impresora';
import { ImpresoraService } from '../../../services/impresora.service';

@Component({
  selector: 'app-form-impresora',
  templateUrl: './form-impresora.component.html',
  styleUrls: ['./form-impresora.component.css']
})
export class FormImpresoraComponent implements OnInit {

  @Input() impresora: Impresora;
  @Output() impresoraSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  constructor(
    private snackBar: MatSnackBar,
    private impresoraSrvc: ImpresoraService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  resetImpresora = () => this.impresora = {
    impresora: null, nombre: null, direccion_ip: null, ubicacion: null, bluetooth: 0, sede: null, bluetooth_mac_address: null, modelo: null, pordefecto: 0, pordefectocuenta: 0, pordefectofactura: 0
  }

  onSubmit = () => {
    this.impresoraSrvc.save(this.impresora).subscribe(res => {
      // console.log(res);
      if (res.exito) {
        this.impresoraSavedEv.emit();
        this.resetImpresora();
        this.snackBar.open('Impresora agregada...', 'Impresora', { duration: 3000 });
      } else {
        this.snackBar.open(`ERROR: ${res.mensaje}`, 'Impresora', { duration: 3000 });
      }
    });
  }

}

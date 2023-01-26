import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { TipoCliente } from '@admin-interfaces/tipo-cliente';
import { TipoClienteService } from '@admin-services/tipo-cliente.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-tipo-cliente',
  templateUrl: './form-tipo-cliente.component.html',
  styleUrls: ['./form-tipo-cliente.component.css']
})
export class FormTipoClienteComponent implements OnInit, OnDestroy {

  @Input() tipoCliente: TipoCliente;
  @Output() tipoClienteSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private tipoClienteSrvc: TipoClienteService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetTipoCliente() {
    this.tipoCliente = { tipo_cliente: null, descripcion: null };
  }

  onSubmit() {
    this.endSubs.add(      
      this.tipoClienteSrvc.save(this.tipoCliente).subscribe((res) => {
        if (res.exito) {
          this.resetTipoCliente();
          this.tipoClienteSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Tipo de cliente', { duration: 5000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Tipo de cliente', { duration: 7000 });        
        }
      })
    );
  }

}

import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { FormaPago } from '@admin-interfaces/forma-pago';
import { FpagoService } from '@admin-services/fpago.service';
import { ConfiguracionService } from '@admin-services/configuracion.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-pago',
  templateUrl: './form-pago.component.html',
  styleUrls: ['./form-pago.component.css']
})
export class FormPagoComponent implements OnInit, OnDestroy {

  @Input() fpago: FormaPago;
  @Output() fpagoSavedEv = new EventEmitter();
  public noComandaSinFactura = true;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private fpagoSrvc: FpagoService,
    private configSrvc: ConfiguracionService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.noComandaSinFactura = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_COMANDA_SIN_FACTURA) === false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetFormaPago = () => this.fpago = {
    forma_pago: null, descripcion: null, activo: 1, descuento: 0, aumento_porcentaje: 0.00, comision_porcentaje: 0.00,
    retencion_porcentaje: 0.00, pedirdocumento: 0, adjuntararchivo: 0, pedirautorizacion: 0,
    sinfactura: 0, escobrohabitacion: 0
  }

  onSubmit = () => {
    this.endSubs.add(      
      this.fpagoSrvc.save(this.fpago).subscribe(res => {
        if (res.exito) {
          this.fpagoSavedEv.emit();
          this.resetFormaPago();
          this.snackBar.open('Forma de pago agregada...', 'Forma de pago', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Forma de pago', { duration: 3000 });
        }
      })
    );
  }
}

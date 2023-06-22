import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectChange } from '@angular/material/select';
import { MatTabGroup } from '@angular/material/tabs';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { FormaPago, FormaPagoSedeCuentaContable } from '@admin-interfaces/forma-pago';
import { FpagoService } from '@admin-services/fpago.service';
import { ConfiguracionService } from '@admin-services/configuracion.service';
import { UsuarioSede } from '@admin-interfaces/acceso';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-pago',
  templateUrl: './form-pago.component.html',
  styleUrls: ['./form-pago.component.css']
})
export class FormPagoComponent implements OnInit, OnDestroy {

  @ViewChild('mtgFPago') mtgFPago: MatTabGroup;

  @Input() fpago: FormaPago;
  @Output() fpagoSavedEv = new EventEmitter();
  public noComandaSinFactura = true;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public sedes: UsuarioSede[] = [];
  public fpscc: FormaPagoSedeCuentaContable;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private fpagoSrvc: FpagoService,
    private configSrvc: ConfiguracionService,
    private ls: LocalstorageService,
    private sedeSrvc: AccesoUsuarioService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.noComandaSinFactura = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_COMANDA_SIN_FACTURA) === false;
    this.loadSedes();
    this.resetFormaPago();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadSedes = () => {
    this.endSubs.add(
      this.sedeSrvc.getSedes().subscribe(res => {
        this.sedes = res;
      })
    );
  }

  resetFormaPago = () => {
    this.fpago = {
      forma_pago: null, descripcion: null, activo: 1, descuento: 0, aumento_porcentaje: 0.00, comision_porcentaje: 0.00,
      retencion_porcentaje: 0.00, pedirdocumento: 0, adjuntararchivo: 0, pedirautorizacion: 0,
      sinfactura: 0, escobrohabitacion: 0, porcentaje_maximo_descuento: 0.00
    };
    this.resetFpscc();
  }

  onSubmit = () => {
    this.endSubs.add(
      this.fpagoSrvc.save(this.fpago).subscribe(res => {
        if (res.exito) {
          this.fpagoSavedEv.emit();
          this.resetFormaPago();
          this.snackBar.open('Forma de pago agregada...', 'Forma de pago', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Forma de pago', { duration: 7000 });
        }
      })
    );
  }

  resetFpscc = () => {
    this.fpscc = {
      forma_pago_sede_cuenta_contable: null, forma_pago: this.fpago?.forma_pago || null, sede: null, cuenta_contable: null
    };
  }

  onSedeSelected = (obj: MatSelectChange) => {
    const fltr = { forma_pago: +this.fpago.forma_pago, sede: +obj.value };
    this.endSubs.add(
      this.fpagoSrvc.getFormaPagoSedeCuentaContable(fltr).subscribe(res => {
        if (res && res.length > 0) {
          this.fpscc = res[0];
        }
      })
    );
  }

  onSubmitFpscc = () => {
    this.fpscc.forma_pago = this.fpago?.forma_pago || null;
    this.endSubs.add(      
      this.fpagoSrvc.saveFormaPagoSedeCuentaContable(this.fpscc).subscribe(res => {
        if (res.exito) {
          // this.fpagoSavedEv.emit();
          // this.resetFormaPago();
          this.snackBar.open(res.mensaje, 'Forma de pago', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Forma de pago', { duration: 7000 });
        }        
      })
    );
  }

  esDescuentoChecked = (obj: MatCheckboxChange) =>{
    if (!obj.checked) {
      this.fpago.porcentaje_maximo_descuento = 0.00;
    }
  }
}

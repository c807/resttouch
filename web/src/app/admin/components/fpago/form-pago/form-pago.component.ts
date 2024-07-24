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

  private countAccesoRapido: number = 0;
  public mostrarUsoPropina = false;

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
    this.loadFormasPago();
    this.endSubs.add(
      this.fpagoSrvc.get().subscribe(formasPago => {
        this.countAccesoRapido = formasPago.filter(fp => Number(fp.acceso_rapido) === 1).length;
      })
    );
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
      forma_pago: null, descripcion: null, activo: 1, permitir_propina: 1, descuento: 0, aumento_porcentaje: 0.00, comision_porcentaje: 0.00,
      retencion_porcentaje: 0.00, pedirdocumento: 0, adjuntararchivo: 0, pedirautorizacion: 0,
      sinfactura: 0, acceso_rapido: 0, escobrohabitacion: 0, porcentaje_maximo_descuento: 0.00, porcentaje_descuento_aplicado: 0.00
    };
    this.resetFpscc();
  }

  loadFormasPago = () => {
    this.endSubs.add(
      this.fpagoSrvc.get().subscribe(formasPago => {
        this.countAccesoRapido = formasPago.filter(fp => Number(fp.acceso_rapido) === 1).length;
      })
    );
  }
  
  onSubmit = () => {
    const accesoRapido = Number(this.fpago.acceso_rapido);
    if (accesoRapido === 1 && this.countAccesoRapido >= 3) {
      this.snackBar.open('No se pueden tener más de 3 formas de pago con acceso rápido.', 'Error', { duration: 7000 });
      return;
    }

    if (this.fpago.porcentaje_descuento_aplicado > this.fpago.porcentaje_maximo_descuento) {
      this.snackBar.open('El porcentaje de descuento a aplicar no puede ser mayor que el porcentaje máximo de descuento.', 'Error', { duration: 7000 });
      return;
    }

    this.endSubs.add(
      this.fpagoSrvc.save(this.fpago).subscribe(res => {
        if (res.exito) {
          this.loadFormasPago();
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
    this.mostrarUsoPropina = false;

    if (!obj.checked) {
      this.fpago.porcentaje_maximo_descuento = 0.00;
    } else {
      this.mostrarUsoPropina = true;
    }

    if (this.mostrarUsoPropina && this.fpago.forma_pago === null) {
      this.fpago.permitir_propina = 1
    }
  }
}

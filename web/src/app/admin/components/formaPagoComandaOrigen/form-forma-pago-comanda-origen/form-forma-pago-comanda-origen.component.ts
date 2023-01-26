import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { FormaPagoComandaOrigen, FormaPago } from '@admin-interfaces/forma-pago';
import { ComandaOrigen } from '@admin-interfaces/comanda-origen';
import { FpagoService } from '@admin-services/fpago.service';
import { ComandaOrigenService } from '@admin-services/comanda-origen.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-forma-pago-comanda-origen',
  templateUrl: './form-forma-pago-comanda-origen.component.html',
  styleUrls: ['./form-forma-pago-comanda-origen.component.css']
})
export class FormFormaPagoComandaOrigenComponent implements OnInit, OnDestroy {

  @Input() formaPagoComandaOrigen: FormaPagoComandaOrigen;
  @Output() formaPagoComandaOrigenSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  public lstFormasPago: FormaPago[] = [];
  public lstComandaOrigen: ComandaOrigen[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private fpagoSrvc: FpagoService,
    private comandOrigenSrvc: ComandaOrigenService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadFormasPago();
    this.loadComandaOrigen();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadFormasPago = () => {
    this.endSubs.add(      
      this.fpagoSrvc.get({ activo: 1 }).subscribe(res => {
        this.lstFormasPago = res;        
      })
    );
  }

  loadComandaOrigen = () => {
    this.endSubs.add(      
      this.comandOrigenSrvc.get().subscribe(res => {
        this.lstComandaOrigen = res;        
      })
    );
  }

  resetFormaPagoComandaOrigen = () => this.formaPagoComandaOrigen = {
    forma_pago_comanda_origen: null, forma_pago: null, comanda_origen: null, codigo: null
  }

  onSubmit = () => {
    this.endSubs.add(      
      this.fpagoSrvc.saveFormaPagoComandaOrigen(this.formaPagoComandaOrigen).subscribe(res => {      
        if (res.exito) {
          this.formaPagoComandaOrigenSavedEv.emit();
          this.resetFormaPagoComandaOrigen();
          this.snackBar.open('Forma de pago relacionada con el origen de pedidos...', 'Forma de pago por origen', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Forma de pago por origen', { duration: 3000 });
        }
      })
    );
  }
}

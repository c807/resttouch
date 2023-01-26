import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { TipoCompraVenta } from '@admin-interfaces/tipo-compra-venta';
import { TipoCompraVentaService } from '@admin-services/tipo-compra-venta.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-tipo-compra-venta',
  templateUrl: './form-tipo-compra-venta.component.html',
  styleUrls: ['./form-tipo-compra-venta.component.css']
})
export class FormTipoCompraVentaComponent implements OnInit, OnDestroy {

  @Input() tipoCompraVenta: TipoCompraVenta;
  @Output() tipoCompraVentaSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private tipoCompraVentaSrvc: TipoCompraVentaService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetTipoCompraVenta() {
    this.tipoCompraVenta = { tipo_compra_venta: null, descripcion: null, abreviatura: null, codigo: null };
  }

  onSubmit() {
    this.endSubs.add(      
      this.tipoCompraVentaSrvc.save(this.tipoCompraVenta).subscribe((res) => {
        if (res) {
          this.resetTipoCompraVenta();
          this.tipoCompraVentaSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Tipo de compra/venta', { duration: 5000 });
        }
      })
    );
  }

}

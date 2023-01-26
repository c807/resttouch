import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { VendorTercero } from '@admin-interfaces/vendor-tercero';
import { ComandaOrigen } from '@admin-interfaces/comanda-origen';
import { VendorTerceroService } from '@admin-services/vendor-tercero.service';
import { ComandaOrigenService } from '@admin-services/comanda-origen.service';
import { FormSedeVendorTerceroComponent } from '@admin-components/vendor-tercero/form-sede-vendor-tercero/form-sede-vendor-tercero.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-vendor-tercero',
  templateUrl: './form-vendor-tercero.component.html',
  styleUrls: ['./form-vendor-tercero.component.css']
})
export class FormVendorTerceroComponent implements OnInit, OnDestroy {

  @Input() vendorTercero: VendorTercero;
  @Output() vendorTerceroSavedEv = new EventEmitter();
  @ViewChild('frmSedeVendorTercero') frmSedeVendorTercero: FormSedeVendorTerceroComponent;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public lstComandaOrigen: ComandaOrigen[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private vendorTerceroSrvc: VendorTerceroService,
    private comandaOrigenSrvc: ComandaOrigenService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadComandaOrigen();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadComandaOrigen = () => {
    this.endSubs.add(      
      this.comandaOrigenSrvc.get().subscribe(res => {
        this.lstComandaOrigen = res || [];
      })
    );
  }

  resetVendorTercero() {
    this.vendorTercero = { vendor_tercero: null, nombre: null, comanda_origen: null };
    this.frmSedeVendorTercero.resetSedeVendorTercero();
  }

  onSubmit() {
    this.endSubs.add(      
      this.vendorTerceroSrvc.save(this.vendorTercero).subscribe((res) => {
        if (res.exito) {
          this.resetVendorTercero();
          this.vendorTerceroSavedEv.emit();
          this.snackBar.open(res.mensaje, 'Vendor', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Vendor', { duration: 7000 });
        }
      })
    );
  }
}

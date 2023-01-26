import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Sede } from '@admin-interfaces/sede';
import { SedeVendorTercero } from '@admin-interfaces/vendor-tercero';
import { SedeService } from '@admin-services/sede.service';
import { VendorTerceroService } from '@admin-services/vendor-tercero.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-sede-vendor-tercero',
  templateUrl: './form-sede-vendor-tercero.component.html',
  styleUrls: ['./form-sede-vendor-tercero.component.css']
})
export class FormSedeVendorTerceroComponent implements OnInit, OnDestroy {

  @Input() sedeVendorTercero: SedeVendorTercero = { sede_vendor_tercero: null, sede: null, vendor_tercero: null };
  public lstSedes: Sede[] = [];

  private endSubs = new Subscription();

  constructor(
    private sedeSrvc: SedeService,
    private snackBar: MatSnackBar,
    private vendorTerceroSrvc: VendorTerceroService
  ) { }

  ngOnInit(): void {
    this.loadSedes();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadSedes = () => {
    this.endSubs.add(      
      this.sedeSrvc.get().subscribe(res => {
        this.lstSedes = res || [];
      })
    );
  }  

  resetSedeVendorTercero = () => this.sedeVendorTercero = { sede_vendor_tercero: null, sede: null, vendor_tercero: null };

  onSubmit() {
    this.endSubs.add(      
      this.vendorTerceroSrvc.saveSedeVendorTercero(this.sedeVendorTercero).subscribe((res) => {
        if (res.exito) {        
          this.snackBar.open(res.mensaje, 'Sede de vendor', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Sede de vendor', { duration: 7000 });
        }
      })
    );
  }

  getSedeVendorTercero = () => {    
    if (+this.sedeVendorTercero.vendor_tercero > 0) {
      this.endSubs.add(        
        this.vendorTerceroSrvc.getSedeVendorTercero({ vendor_tercero: +this.sedeVendorTercero.vendor_tercero }).subscribe(res => {
          if (res && res.length > 0) {
            this.sedeVendorTercero = res[0];          
          }
        })
      );
    }
  }
}

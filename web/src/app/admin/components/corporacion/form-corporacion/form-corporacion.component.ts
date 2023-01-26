import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Corporacion } from '@admin-interfaces/sede';
import { SedeService } from '@admin-services/sede.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-corporacion',
  templateUrl: './form-corporacion.component.html',
  styleUrls: ['./form-corporacion.component.css']
})
export class FormCorporacionComponent implements OnInit, OnDestroy {

  @Input() corporacion: Corporacion;
  @Output() corporacionSavedEv = new EventEmitter();

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private sedeSrvc: SedeService,
  ) { }

  ngOnInit() { }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetCorporacion = () => this.corporacion = {
    corporacion: null, admin_llave: null, nombre: null
  }

  onSubmit = () => {
    this.endSubs.add(      
      this.sedeSrvc.saveCorporacion(this.corporacion).subscribe(res => {
        if (res.exito) {
          this.corporacionSavedEv.emit();
          this.resetCorporacion();
          this.snackBar.open('Corporación guardada exitosamente.', 'Corporación', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Corporación', { duration: 3000 });
        }
      })
    );
  }

}

import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { ImpuestoEspecial } from '@admin-interfaces/impuesto-especial';
import { ImpuestoEspecialService } from '@admin-services/impuesto-especial.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-impuesto-especial',
  templateUrl: './form-impuesto-especial.component.html',
  styleUrls: ['./form-impuesto-especial.component.css']
})
export class FormImpuestoEspecialComponent implements OnInit, OnDestroy {

  @Input() impuestoEspecial: ImpuestoEspecial;
  @Output() impuestoEspecialSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private impuestoEspecialSrvc: ImpuestoEspecialService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetImpuestoEspecial() {
    this.impuestoEspecial = { impuesto_especial: null, descripcion: null, porcentaje: null, descripcion_interna: null, codigo_sat: null };
  }

  onSubmit() {
    this.endSubs.add(      
      this.impuestoEspecialSrvc.save(this.impuestoEspecial).subscribe((res) => {
        if (res) {
          this.resetImpuestoEspecial();
          this.impuestoEspecialSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Impuesto especial', { duration: 5000 });
        }
      })
    );
  }

}

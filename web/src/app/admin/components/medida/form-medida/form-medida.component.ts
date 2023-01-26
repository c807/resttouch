import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Medida } from '@admin-interfaces/medida';
import { MedidaService } from '@admin-services/medida.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-medida',
  templateUrl: './form-medida.component.html',
  styleUrls: ['./form-medida.component.css']
})
export class FormMedidaComponent implements OnInit, OnDestroy {

  @Input() medida: Medida;
  @Output() medidaSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private medidaSrvc: MedidaService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetMedida = () => this.medida = { medida: null, descripcion: null };

  onSubmit = () => {
    this.endSubs.add(      
      this.medidaSrvc.save(this.medida).subscribe(res => {        
        if (res.exito) {
          this.medidaSavedEv.emit();
          this.resetMedida();
          this.snackBar.open('Medida agregada...', 'Unida de medida', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Unida de medida', { duration: 3000 });
        }
      })
    );
  }

}

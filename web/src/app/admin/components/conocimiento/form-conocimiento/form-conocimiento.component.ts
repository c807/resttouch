import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Conocimiento } from '@admin-interfaces/conocimiento';
import { ConocimientoService } from '@admin-services/conocimiento.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-conocimiento',
  templateUrl: './form-conocimiento.component.html',
  styleUrls: ['./form-conocimiento.component.css']
})
export class FormConocimientoComponent implements OnInit, OnDestroy {

  @Input() conocimiento: Conocimiento;
  @Output() conocimientoSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private conocimientoSrvc: ConocimientoService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetConocimiento();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetConocimiento = () => this.conocimiento = { conocimiento: null, asunto: null, resumen: null };

  onSubmit = () => {
    this.endSubs.add(      
      this.conocimientoSrvc.save(this.conocimiento).subscribe(res => {        
        if (res.exito) {
          this.conocimientoSavedEv.emit();
          this.resetConocimiento();
          this.snackBar.open('Conocimiento agregado...', 'Conocimiento', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Conocimiento', { duration: 7000 });
        }
      })
    );
  }

}

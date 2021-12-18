import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { EstatusCallcenter } from '../../../interfaces/estatus-callcenter';
import { EstatusCallcenterService } from '../../../services/estatus-callcenter.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-estatus-callcenter',
  templateUrl: './form-estatus-callcenter.component.html',
  styleUrls: ['./form-estatus-callcenter.component.css']
})
export class FormEstatusCallcenterComponent implements OnInit, OnDestroy {

  @Input() estatusCallcenter: EstatusCallcenter;
  @Output() estatusCallcenterSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private estatusCallcenterSrvc: EstatusCallcenterService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetEstatusCallcenter() {
    this.estatusCallcenter = { estatus_callcenter: null, descripcion: null, color: null, orden: null, esautomatico: null };
  }

  onSubmit() {
    this.endSubs.add(      
      this.estatusCallcenterSrvc.save(this.estatusCallcenter).subscribe((res) => {
        if (res) {
          this.resetEstatusCallcenter();
          this.estatusCallcenterSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Tiempo de entrega', { duration: 5000 });
        }
      })
    );
  }  

}

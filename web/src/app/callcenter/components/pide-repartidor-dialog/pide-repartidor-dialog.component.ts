import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Repartidor } from '@callcenter-interfaces/repartidor';
import { RepartidorService } from '@callcenter-services/repartidor.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pide-repartidor-dialog',
  templateUrl: './pide-repartidor-dialog.component.html',
  styleUrls: ['./pide-repartidor-dialog.component.css']
})
export class PideRepartidorDialogComponent implements OnInit, OnDestroy {

  public lstRepartidores: Repartidor[] = [];
  public idRepartidor: number = null;

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<PideRepartidorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private repartidorSrvc: RepartidorService,
    private ls: LocalstorageService,
  ) { }

  ngOnInit(): void {
    this.loadRepartidores();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadRepartidores = () => {
    this.endSubs.add(
      this.repartidorSrvc.get({ debaja: 0, sede: this.ls.get(GLOBAL.usrTokenVar).sede }).subscribe(lista => this.lstRepartidores = lista)
    );
  }

  asignar = () => this.dialogRef.close(+this.idRepartidor);

  cancelar = () => this.dialogRef.close();

}

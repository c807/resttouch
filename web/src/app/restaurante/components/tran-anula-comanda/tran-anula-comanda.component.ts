import { Component, OnInit, OnDestroy } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Turno } from '@restaurante-interfaces/turno';
import { TurnoService } from '@restaurante-services/turno.service';
import { ComandaService } from '@restaurante-services/comanda.service';
import { UsuarioService } from '@admin-services/usuario.service';
import { RazonAnulacion } from '@admin-interfaces/razon-anulacion';
import { AnulacionService } from '@admin-services/anulacion.service';
import { CheckPasswordComponent, ConfigCheckPasswordModel } from '@shared-components/check-password/check-password.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared-components/confirm-dialog/confirm-dialog.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tran-anula-comanda',
  templateUrl: './tran-anula-comanda.component.html',
  styleUrls: ['./tran-anula-comanda.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class TranAnulaComandaComponent implements OnInit, OnDestroy {

  get esGerente() {
    return this.rolesUsuario.indexOf('gerente') > -1;
  }

  public lstTurnos: Turno[] = [];
  public lstComandas: any[] = [];
  public params: any = {
    estatus: 2,
    turno: null
  };
  public rolesUsuario = '';
  public columnsToDisplay = ['comanda', 'fhcreacion', 'mesero', 'total', 'acciones'];
  public expandedElement: any | null;
  public cargando = false;
  public razonesAnulacion: RazonAnulacion[] = [];

  private endSubs = new Subscription();

  constructor(
    private turnoSrvc: TurnoService,
    private ls: LocalstorageService,
    private comandaSrvc: ComandaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private usuarioSrvc: UsuarioService,
    private anulacionSrvc: AnulacionService
  ) { }

  ngOnInit(): void {
    this.loadRolesUsuario();
    this.loadTurnos();
    this.loadRazonesAnulacion();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadRolesUsuario = () => this.usuarioSrvc.getRolesTurno(this.ls.get(GLOBAL.usrTokenVar).idusr).subscribe(res => this.rolesUsuario = res.roles);

  loadTurnos = () => {
    this.lstTurnos = [];
    this.endSubs.add(
      this.turnoSrvc.get({ sede: (+this.ls.get(GLOBAL.usrTokenVar).sede || 0) }).subscribe((lst: Turno[]) => {
        this.lstTurnos = lst;
      })
    );
  }

  loadComandasDeTurno = () => {
    this.lstComandas = [];
    this.cargando = true;
    this.endSubs.add(
      this.comandaSrvc.listaComandas(this.params).subscribe((lst: any[]) => {
        this.lstComandas = lst;
        this.cargando = false;
      })
    );
  }

  loadRazonesAnulacion = () => {
    this.endSubs.add(
      this.anulacionSrvc.get().subscribe(res => {
        this.razonesAnulacion = res;
      })
    );
  }

  chkValidaPwd = (idComanda: number) => {
    this.cargando = true;
    const dialogChkPass = this.dialog.open(CheckPasswordComponent, {
      width: '40%',
      disableClose: true,
      data: new ConfigCheckPasswordModel(1)
    });

    this.endSubs.add(
      dialogChkPass.afterClosed().subscribe(res => {
        if (res) {
          this.anulaComanda(idComanda);
        } else {
          this.snackBar.open('La contraseña no es correcta.', 'Anular comanda', { duration: 7000 });
        }
        this.cargando = false;
      })
    );
  }

  anulaComanda = (idComanda: number) => {
    this.cargando = true;
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        `Anular comanda #${idComanda}`,
        `Esto anulará la comanda. ¿Desea continuar?`,
        'Sí',
        'No',
        {
          input: [
            {
              select: true,
              label: 'Motivo',
              datos: this.razonesAnulacion,
              valor: null,
              id: 'razon_anulacion',
              descripcion: 'descripcion',
              requerido: true
            },
            {
              select: false,
              label: 'Comentario',
              valor: null,
              id: 'comentario_anulacion',
              requerido: false
            }
          ]
        }
      )
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe((conf: any) => {
        if (conf.resultado) {
          this.cargando = true;
          const params = {
            comanda: idComanda            
          };
          for (let i = 0; i < conf.config.input.length; i++) {
            const input = conf.config.input[i];
            params[input.id] = input.valor;
          }
          // console.log(params); this.cargando = false; return;
          this.endSubs.add(
            this.comandaSrvc.anularComanda(params).subscribe(res => {
              if (res.exito) {
                this.snackBar.open(res.mensaje, 'Anular comanda', { duration: 3000 });
                this.loadComandasDeTurno();
              } else {
                this.snackBar.open(`ERROR: ${res.mensaje}`, 'Anular comanda', { duration: 7000 });
              }
              this.cargando = false;
            })
          );
        }
        this.cargando = false;
      })
    );
  }

}

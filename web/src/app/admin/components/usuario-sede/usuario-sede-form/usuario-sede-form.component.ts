import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { SedeService } from '@admin-services/sede.service';
import { Sede } from '@admin-interfaces/sede'
import { Usuario } from '@admin-interfaces/usuario';
import { UsuarioSede } from '@admin-interfaces/acceso';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';

import { Subscription } from 'rxjs';

@Component({
	selector: 'app-usuario-sede-form',
	templateUrl: './usuario-sede-form.component.html',
	styleUrls: ['./usuario-sede-form.component.css']
})
export class UsuarioSedeFormComponent implements OnInit, OnDestroy {

	@Input() usuario: Usuario;
	@Output() AccesoUsuarioSavedEv = new EventEmitter();

	public accesos: UsuarioSede[] = [];
	public sedes: Sede[] = []
	public acceso: UsuarioSede;
	public displayedColumns: string[] = ['sede', 'editItem'];
	public dataSource: MatTableDataSource<UsuarioSede>;

	private endSubs = new Subscription();

	constructor(
		private snackBar: MatSnackBar,
		private accesoUsuarioSrvc: AccesoUsuarioService,
		private sedeSrvc: SedeService,
		public dialog: MatDialog,
	) {
		this.resetAcceso();
	}

	ngOnInit() {
		this.loadSedes()
	}

	ngOnDestroy(): void {
		this.endSubs.unsubscribe();
	}

	loadAccesos = (idusuario: number = +this.usuario.usuario) => {
		this.endSubs.add(			
			this.accesoUsuarioSrvc.getSedes({ usuario: idusuario }).subscribe((res: any[]) => {
				this.accesos = res || [];
				this.updateTableDataSource();				
			})
		);
	}

	loadSedes = () => {
		this.endSubs.add(			
			this.sedeSrvc.get().subscribe(res => {
				this.sedes = res || [];
			})
		);
	}

	resetAcceso = () => {
		this.acceso = {
			usuario_sede: null, sede: null, usuario: null, anulado: 0
		};
	}

	setAcceso = (pres: any) => {
		this.acceso = {
			usuario_sede: pres.usuario_sede,
			sede: pres.sede.sede,
			usuario: pres.usuario.usuario,
			anulado: pres.anulado
		};
	}

	onSubmit = () => {
		this.acceso.usuario = this.usuario.usuario;
		this.endSubs.add(			
			this.accesoUsuarioSrvc.saveSedes(this.acceso).subscribe(res => {
				if (res.exito) {					
					this.loadAccesos(this.usuario.usuario);
					this.snackBar.open('Acceso guardado con éxito...', 'Sede Usuario', { duration: 3000 });
					this.acceso.sede = null;
				} else {
					this.snackBar.open(`ERROR: ${res.mensaje}`, 'Sede Usuario', { duration: 3000 });
				}
			})
		);
	}

	removerAcceso = (pres: any) => {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			maxWidth: '400px',
			data: new ConfirmDialogModel(
				'Eliminar sede de usuario', `¿Seguro(a) de eliminar la sede '${pres.sede.nombre}' del usuario '${this.usuario.nombres}'?`, 'Sí', 'No'
			)
		});

		this.endSubs.add(			
			dialogRef.afterClosed().subscribe(cnf => {
				if (cnf) {
					pres.anulado = 1;
					this.endSubs.add(						
						this.accesoUsuarioSrvc.saveSedes(pres).subscribe(res => {
							if (res.exito) {
								this.resetAcceso();
								this.loadAccesos(this.usuario.usuario);
								this.snackBar.open('Removido con éxito...', 'Sede Usuario', { duration: 3000 });
							} else {
								this.snackBar.open(`ERROR: ${res.mensaje}`, 'Sede Usuario', { duration: 3000 });
							}
						})
					);
				}
			})
		);
	}

	updateTableDataSource = () => this.dataSource = new MatTableDataSource(this.accesos);

	sedeYaAsignada = (idSede: number) => {
		const asignadas: any[] = JSON.parse(JSON.stringify(this.accesos));
		return asignadas.findIndex(a => idSede === +a.sede.sede) >= 0;
	}

}

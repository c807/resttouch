import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Usuario } from '@admin-interfaces/usuario';
import { UsuarioService } from '@admin-services/usuario.service';

import { Subscription } from 'rxjs';

@Component({
	selector: 'app-lista-acceso-usuario',
	templateUrl: './lista-acceso-usuario.component.html',
	styleUrls: ['./lista-acceso-usuario.component.css']
})
export class ListaAccesoUsuarioComponent implements OnInit, OnDestroy {

	public lstUsuario: Usuario[];
	public lstUsuarioPaged: Usuario[];
	@Output() getUsuarioEv = new EventEmitter();

	public length = 0;
	public pageSize = 5;
	public pageSizeOptions: number[] = [5, 10, 15];
	public pageIndex = 0;
	public pageEvent: PageEvent;
	public txtFiltro = '';
	public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
	public esMovil = false;

	private endSubs = new Subscription();

	constructor(
		private UsuarioSrvc: UsuarioService,
		private ls: LocalstorageService
	) { }

	ngOnInit() {
		this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
		this.loadUsuario();
	}

	ngOnDestroy(): void {
		this.endSubs.unsubscribe();		
	}

	applyFilter() {
		if (this.txtFiltro.length > 0) {
			const tmpList = MultiFiltro(this.lstUsuario, this.txtFiltro);
			this.length = tmpList.length;
			this.lstUsuarioPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
		} else {
			this.length = this.lstUsuario.length;
			this.lstUsuarioPaged = PaginarArray(this.lstUsuario, this.pageSize, this.pageIndex + 1);
		}
	}

	loadUsuario = () => {
		this.endSubs.add(			
			this.UsuarioSrvc.getAll().subscribe(lst => {
				if (lst) {
					if (lst.length > 0) {
						this.lstUsuario = lst;
						this.applyFilter();
					}
				}
			})
		);
	}

	getUsuario = (obj: Usuario) => {
		this.getUsuarioEv.emit(obj);
	}

	pageChange = (e: PageEvent) => {
		this.pageSize = e.pageSize;
		this.pageIndex = e.pageIndex;
		this.applyFilter();
	}
}
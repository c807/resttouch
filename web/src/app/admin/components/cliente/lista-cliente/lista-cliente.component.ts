import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL, PaginarArray, MultiFiltro } from '../../../../shared/global';
import { LocalstorageService } from '../../../services/localstorage.service';

import { Cliente } from '../../../interfaces/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { FormClienteDialogComponent } from '../form-cliente-dialog/form-cliente-dialog.component';

@Component({
  selector: 'app-lista-cliente',
  templateUrl: './lista-cliente.component.html',
  styleUrls: ['./lista-cliente.component.css'],  
})
export class ListaClienteComponent implements OnInit {

  public lstClientes: Cliente[];
  public lstClientesPaged: Cliente[];
  @Input() showAddButton = false;
  @Output() getClienteEv = new EventEmitter();
  // @ViewChild('paginador') paginador: MatPaginator;

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  constructor(
    public dialogAddCliente: MatDialog,
    private snackBar: MatSnackBar,
    private clienteSrvc: ClienteService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadClientes();
  }

  applyFilter = (cambioPagina = false) => {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstClientes, this.txtFiltro);
      this.length = tmpList.length;
      // this.lstClientesPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
      this.lstClientesPaged = JSON.parse(JSON.stringify(tmpList));
    } else {
      this.length = this.lstClientes.length;
      // this.lstClientesPaged = PaginarArray(this.lstClientes, this.pageSize, this.pageIndex + 1);
      this.lstClientesPaged = JSON.parse(JSON.stringify(this.lstClientes));;
    }
    // if (!cambioPagina) {
    //   this.paginador.firstPage();
    // }
  }

  validateKey = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[a-zA-Z0-9 -]/.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

  loadInfoContribuyente = (nit: string) => {
    const tmpnit = nit.trim().toUpperCase().replace(/[^a-zA-Z0-9]/gi, '');
    if (tmpnit !== 'CF') {
      this.clienteSrvc.getInfoContribuyente(tmpnit).subscribe(res => {
        if (res.exito) {
          const tmpCliente: Cliente = {
            cliente: undefined,
            nombre: res.contribuyente.nombre,
            nit: tmpnit,
            direccion: res.contribuyente.direccion
          };
          this.clienteSrvc.save(tmpCliente).subscribe(resNvoCliente => {
            if (resNvoCliente.exito) {
              this.loadClientes();
              this.getCliente(resNvoCliente.cliente);
              this.snackBar.open(`${res.mensaje}. Cliente agregado.`, 'Cliente', { duration: 3000 });
            } else {
              this.snackBar.open(`ERROR: ${resNvoCliente.mensaje}`, 'Cliente', { duration: 7000 });
            }
          });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Cliente', { duration: 7000 });
        }
      });
    }
  }

  loadClientes = () => {
    this.clienteSrvc.get().subscribe(lst => {
      if (lst) {
        if (lst.length > 0) {
          this.lstClientes = lst;
          this.applyFilter();
        }
      }
    });
  }

  getCliente = (obj: Cliente) => this.getClienteEv.emit(obj);

  agregarCliente = () => {
    const addClienteRef = this.dialogAddCliente.open(FormClienteDialogComponent, {
      width: '50%',
      data: { esDialogo: true }
    });

    addClienteRef.afterClosed().subscribe(result => {
      if (result) {
        // console.log(result);
        this.loadClientes();
        this.getCliente(result);
      }
    });
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }
}

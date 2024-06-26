import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL, MultiFiltro, seleccionaDocumentoReceptor } from '../../../../shared/global';
import { LocalstorageService } from '../../../services/localstorage.service';

import { Cliente } from '../../../interfaces/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { Municipio } from '../../../interfaces/municipio';
import { MunicipioService } from '../../../services/municipio.service';

import { FormClienteDialogComponent } from '../form-cliente-dialog/form-cliente-dialog.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-cliente',
  templateUrl: './lista-cliente.component.html',
  styleUrls: ['./lista-cliente.component.css'],
})
export class ListaClienteComponent implements OnInit, OnDestroy {

  get desHabilitaCliente() {
    return (c: Cliente): boolean => {
      let deshabilitar = false;
      if (+this.totalDeCuenta >= 2500) {
        const documento = seleccionaDocumentoReceptor(c, this.municipios);
        deshabilitar = documento?.documento && documento?.tipo && documento.documento !== 'CF' ? false : true;
      }
      return deshabilitar;
    }
  }

  get nuevoCliente(): Cliente {
    const nvoCli: Cliente = {
      cliente: null, nombre: null, direccion: null, nit: null, cui: null, pasaporte: null, telefono: null, correo: null,
      codigo_postal: null, municipio: null, departamento: null, pais_iso_dos: null, observaciones: null, tipo_cliente: null
    };
    return nvoCli;
  }

  public lstClientes: Cliente[];
  public lstClientesPaged: Cliente[];
  @Input() showAddButton = false;
  @Input() totalDeCuenta = 0;
  @Output() getClienteEv = new EventEmitter();

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public municipios: Municipio[] = [];

  private endSubs = new Subscription();

  constructor(
    public dialogAddCliente: MatDialog,
    private snackBar: MatSnackBar,
    private clienteSrvc: ClienteService,
    private ls: LocalstorageService,
    private mupioSrvc: MunicipioService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadMunicipios();
    this.loadClientes();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter = () => {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstClientes, this.txtFiltro);
      this.length = tmpList.length;
      this.lstClientesPaged = JSON.parse(JSON.stringify(tmpList));
    } else {
      this.length = this.lstClientes.length;
      this.lstClientesPaged = JSON.parse(JSON.stringify(this.lstClientes));;
    }
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
      this.endSubs.add(
        this.clienteSrvc.getInfoContribuyente(tmpnit).subscribe(res => {
          if (res.exito) {
            const tmpCliente: Cliente = {
              cliente: undefined,
              nombre: res.contribuyente.nombre,
              nit: tmpnit,
              direccion: res.contribuyente.direccion
            };
            this.endSubs.add(
              this.clienteSrvc.save(tmpCliente).subscribe(resNvoCliente => {
                if (resNvoCliente.exito) {
                  if (this.clienteSrvc.lstClientes.length > 0) {
                    this.clienteSrvc.lstClientes.push(resNvoCliente.cliente as Cliente);
                  }
                  this.loadClientes();
                  this.getCliente(resNvoCliente.cliente);
                  this.snackBar.open(`${res.mensaje}. Cliente agregado.`, 'Cliente', { duration: 3000 });
                } else {
                  this.snackBar.open(`ERROR: ${resNvoCliente.mensaje}`, 'Cliente', { duration: 7000 });
                }
              })
            );
          } else {
            this.snackBar.open(`ERROR: ${res.mensaje}`, 'Cliente', { duration: 7000 });
          }
        })
      );
    }
  }

  loadClientes = () => {
    this.lstClientes = this.clienteSrvc.lstClientes || [];
    if (this.lstClientes.length === 0) {
      this.clienteSrvc.get().subscribe(lst => {
        this.lstClientes = lst;
        this.clienteSrvc.lstClientes = [...this.lstClientes];
        this.applyFilter();
      });
    } else {
      this.applyFilter();
    }
  }

  loadMunicipios = () => this.endSubs.add(this.mupioSrvc.get().subscribe(res => this.municipios = res));                                            

  getCliente = (obj: Cliente) => this.getClienteEv.emit(obj);

  agregarCliente = (cli: Cliente = this.nuevoCliente, idx: number = 0) => {
    const addClienteRef = this.dialogAddCliente.open(FormClienteDialogComponent, {
      width: '75%',
      data: { esDialogo: true, cliente: JSON.parse(JSON.stringify(cli)) }
    });

    this.endSubs.add(
      addClienteRef.afterClosed().subscribe(result => {
        if (result) {
          // console.log(result);
          if (!(+idx > 0) && this.clienteSrvc.lstClientes.length > 0) {
            const indice = this.clienteSrvc.lstClientes.findIndex(c => +c.cliente === +(result as Cliente).cliente);
            if (indice > 0) {
              this.clienteSrvc.lstClientes[indice] = {...(result as Cliente)};
            } else {
              this.clienteSrvc.lstClientes.push(result as Cliente);
            }
          }
          this.loadClientes();
          this.getCliente(result);                             
          this.txtFiltro = (result as Cliente).nombre;
          this.applyFilter();
          if (+idx > 0) {
            this.reemplazaClienteDeLista(result, idx);
          }
        }
      })
    );
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter();
  }

  reemplazaClienteDeLista = (cli: Cliente, idx: number) => {
    const idCliente = +cli.cliente;
    this.lstClientesPaged[idx] = cli;
    const idxListaOriginal = this.lstClientes.findIndex(c => +c.cliente === idCliente);
    if (idxListaOriginal >= 0) {
      this.lstClientes[idxListaOriginal] = cli;
    }
  }

  setClienteCF = () => {
    let cf = this.lstClientes.filter(e => {
      return e.nit.toLowerCase() == "cf"
    })

    if (cf.length > 0) {
      let cli = cf[0]
      if (!this.desHabilitaCliente(cli)) {
        this.getCliente(cli)
      } else {
        this.snackBar.open('No se puede seleccionar Consumidor Final cuando el monto soprepasa los Q2,500', 'Elija otro cliente', { duration: 3000 });
      }
    }

  }
}


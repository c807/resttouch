import { Telefono } from './telefono';
import { TipoDireccion } from './tipo-direccion';
import {Cliente} from '../../admin/interfaces/cliente';
import {Sede} from "../../admin/interfaces/sede";


export interface ClienteMasterCliente {
  cliente_master_cliente: number;
  cliente_master: number;
  cliente: Cliente;
  debaja: number;
}

export interface ClienteMaster {
    cliente_master: number;
    nombre: string;
    correo?: string;
    fecha_nacimiento?: string;
}

export interface ClienteMasterTelefono extends ClienteMaster, Telefono {
    cliente_master_telefono: number;
}

export interface ClienteMasterDireccion {
    cliente_master_direccion: number;
    cliente_master: number;
    tipo_direccion: number;
    direccion1: string;
    direccion2?: string;
    zona?: number;
    codigo_postal?: string;
    municipio?: string;
    departamento?: string;
    pais?: string;
    notas?: string;
    sede?: number;
    debaja?: number;
    sede?: number;
}

export interface ClienteMasterDireccionResponse {
    cliente_master_direccion: number;
    cliente_master: ClienteMaster;
    tipo_direccion: TipoDireccion;
    direccion1: string;
    direccion2?: string;
    zona?: number;
    codigo_postal?: string;
    municipio?: string;
    departamento?: string;
    pais?: string;
    notas?: string;
    debaja?: number;
    sede?: number;
    direccion_completa?: string;
    sede?: Sede;
}

export interface ClienteMasterNota {
  cliente_master_nota: number;
  cliente_master: number;
  fecha_hora: any;
  nota: string;
  debaja: number;
}

export interface ClienteMasterNotaResponse {
  cliente_master_nota: number;
  cliente_master: ClienteMaster;
  fecha_hora: any;
  nota: string;
  debaja: number;
}

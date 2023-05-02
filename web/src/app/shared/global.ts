const LOCALHOST = ['localhost', '127.0.0.1'];
export const PROTOCOLO = window.location.protocol;
export const ANFITRION = window.location.hostname;
export const ES_QA_PROD = LOCALHOST.indexOf(ANFITRION) < 0;
const urlBase = `${PROTOCOLO}//${ANFITRION}/${ES_QA_PROD ? 'api' : 'resttouch'}`;
import * as moment from 'moment';
import { Municipio } from '@admin-interfaces/municipio';
import { Cliente } from '@admin-interfaces/cliente';

export const GLOBAL = {
  rtVersion: '2023.05.02.12.09.24',
  dbDateFormat: 'YYYY-MM-DD',
  dbDateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
  dbDateTimeFormatMilli: 'YYYY-MM-DD HH:mm:ss.SSS',
  dateFormat: 'DD/MM/YYYY',
  dateFormatBT: 'DD-MM-YYYY',
  dateTimeFormat: 'DD/MM/YYYY HH:mm:ss',
  dateTimeFormatMilli: 'DD/MM/YYYY HH:mm:ss.SSS',
  dateTimeFormatBT: 'DD-MM-YYYY HH:mm:ss',
  dateTimeFormatBTMilli: 'DD-MM-YYYY HH:mm:ss.SSS',
  dateTimeFormatRptName: 'YYYYMMDDHHmmss',
  timeFormat: 'HH:mm:ss',
  timeFormatMilli: 'HH:mm:ss.SSS',
  url: `${urlBase}/index.php`,
  urlAppRestaurante: `${urlBase}/restaurante.php`,
  urlCatalogos: `${urlBase}/index.php/catalogo`,
  urlMantenimientos: `${urlBase}/index.php/mante`,
  urlWms: `${urlBase}/wms.php`,
  urlFacturacion: `${urlBase}/facturacion.php`,
  urlGhostKitchen: `${urlBase}/ghost_kitchen.php`,
  urlCallCenter: `${urlBase}/call_center.php`,
  urlRtChefBot: ES_QA_PROD ? 'https://ask-rt-chefbot.azurewebsites.net/api/ask_rt_chefbot' : 'http://localhost:7071/api/ask_rt_chefbot',
  usrTokenVar: 'rttoken',
  usrUnlockVar: 'rtunlock',
  rtClientePedido: 'rt_cliente_pedido',
  rtTipoDomicilio: 'rt_tipo_domicilio',
  rtDireccionEntrega: 'rt_direccion_entrega',
  rtClienteFactura: 'rt_cliente_factura',
  usrLastModuleVar: 'rtlastmodule',
  reintentos: 0,
  IDIOMA_TECLADO: 'Español',
  DEEP_LINK_ANDROID: 'intent://scan/impresion/__INFOBASE64__#Intent;scheme=restouch;package=com.restouch.impresion;end',
  FORMATO_EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  sonidos_rt: '/assets/sonidos',
  CONSTANTES: {
    RT_IMPRESORA_DEFECTO: 'RT_IMPRESORA_DEFECTO',
    RT_PANTALLA_TOMA_COMANDA: 'RT_PANTALLA_TOMA_COMANDA',
    RT_HABILITA_BLOQUEO_INACTIVIDAD: 'RT_HABILITA_BLOQUEO_INACTIVIDAD',
    RT_SEGUNDOS_INACTIVIDAD: 'RT_SEGUNDOS_INACTIVIDAD',
    RT_FACTURA_PROPINA: 'RT_FACTURA_PROPINA',
    RT_CONCEPTO_MAYOR_VENTA: 'RT_CONCEPTO_MAYOR_VENTA',
    RT_CUENTA_CONTABLE_IVA_VENTA: 'RT_CUENTA_CONTABLE_IVA_VENTA',
    RT_INGRESO_NUMERO_PEDIDO: 'RT_INGRESO_NUMERO_PEDIDO',
    RT_TOTAL_NUMEROS_PEDIDO: 'RT_TOTAL_NUMEROS_PEDIDO',
    RT_VENDE_NEGATIVO: 'RT_VENDE_NEGATIVO',
    RT_MODO_COMANDA: 'RT_MODO_COMANDA',
    RT_COMANDA_SIN_FACTURA: 'RT_COMANDA_SIN_FACTURA',
    RT_MODO_FACTURA: 'RT_MODO_FACTURA',
    RT_MESERO_POR_DEFECTO: 'RT_MESERO_POR_DEFECTO',
    RT_FIRMA_DTE_AUTOMATICA: 'RT_FIRMA_DTE_AUTOMATICA',
    RT_CAMPO_NIT: 'RT_CAMPO_NIT',
    RT_ORDER_ITEMS_FULLFILLED: 'RT_ORDER_ITEMS_FULLFILLED',
    RT_CUENTA_CONTABLE_PROPINA: 'RT_CUENTA_CONTABLE_PROPINA',
    RT_CUENTA_CONTABLE_IVA_PROPINA: 'RT_CUENTA_CONTABLE_IVA_PROPINA',
    RT_IMPRIME_PROPINA_SUGERIDA: 'RT_IMPRIME_PROPINA_SUGERIDA',
    RT_USA_CODIGO_BARRAS: 'RT_USA_CODIGO_BARRAS',
    RT_ENVIA_COMO_BASE64: 'RT_ENVIA_COMO_BASE64',
    RT_IMPRIME_RECETA_EN_COMANDA: 'RT_IMPRIME_RECETA_EN_COMANDA',
    RT_COMBOS_CICLICOS: 'RT_COMBOS_CICLICOS',
    RT_DETALLE_FACTURA_PERSONALIZADO: 'RT_DETALLE_FACTURA_PERSONALIZADO',
    RT_PORCENTAJE_MAXIMO_PROPINA: 'RT_PORCENTAJE_MAXIMO_PROPINA',
    RT_AUTOIMPRIMIR_PEDIDO: 'RT_AUTOIMPRIMIR_PEDIDO',
    RT_PROPINA_AUTOMATICA: 'RT_PROPINA_AUTOMATICA',
    RT_AUTORIZA_CAMBIO_PROPINA: 'RT_AUTORIZA_CAMBIO_PROPINA',
    RT_PROPINA_EN_CALLCENTER: 'RT_PROPINA_EN_CALLCENTER',
    RT_PORCENTAJE_PROPINA: 'RT_PORCENTAJE_PROPINA',
    RT_AUDIO_NOTIFICACION: 'RT_AUDIO_NOTIFICACION',
    RT_PEDIR_CANTIDAD_ARTICULO: 'RT_PEDIR_CANTIDAD_ARTICULO',
    RT_PANTALLA_TOMA_COMBO: 'RT_PANTALLA_TOMA_COMBO',
    RT_GK_SEDE_COBRA_PROPINA: 'RT_GK_SEDE_COBRA_PROPINA',
    RT_GK_SEDE_COBRA_ENTREGA: 'RT_GK_SEDE_COBRA_ENTREGA',
    RT_PERMITE_DETALLE_FACTURA_PERSONALIZADO: 'RT_PERMITE_DETALLE_FACTURA_PERSONALIZADO',
    RT_MAX_DIAS_ANTIGUEDAD_INVENTARIO_FISICO: 'RT_MAX_DIAS_ANTIGUEDAD_INVENTARIO_FISICO',
    RT_HORAS_VALIDEZ_TOKEN: 'RT_HORAS_VALIDEZ_TOKEN',
    RT_AUTO_FIRMA_DTE_COMANDA_LINEA: 'RT_AUTO_FIRMA_DTE_COMANDA_LINEA'
  },
  grupos: [
    {
      id: 1,
      descripcion: 'General'
    },
    {
      id: 2,
      descripcion: 'Sede'
    }
  ],
  frases_isr: [
    {
      id: 1,
      descripcion: 'Sujeto a pagos trimestrales I.S.R.'
    },
    {
      id: 2,
      descripcion: 'Sujeto a retención definitiva I.S.R.'
    },
    {
      id: 3,
      descripcion: 'Sujeto a pago directo I.S.R.'
    },
    {
      id: 4,
      descripcion: 'Exento del I.S.R.'
    }
  ],
  frases_iva: [
    {
      id: 1,
      descripcion: 'Agente de retención del I.V.A.'
    }
  ],
  ALLOWED_URLS: ['/admin/solicitud_registro']
};

export const PaginarArray = (array: any[], pageSize: number, pageNumber: number) =>
  array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

export const CheckObjectType = (objeto, tipo: string) => Object.prototype.toString.call(objeto).toLowerCase().substring(7).indexOf(tipo.trim().toLowerCase()) > -1;

export const MultiFiltro = (array: any[], filtro: any) => {
  if (array.length > 0) {
    const keys = Object.keys(array[0]);
    const tmp: any[] = [];
    let valor: any;
    array.forEach(item => {
      for (const key of keys) {
        if (!!item[key]) {
          if (CheckObjectType(item[key], 'array') || CheckObjectType(item[key], 'object')) {
            valor = JSON.stringify(item[key]);
          } else {
            valor = item[key].toString();
          }
          if (valor.trim().toLowerCase().indexOf(filtro.trim().toLowerCase()) > -1) {
            tmp.push(item);
            break;
          }
        }
      }
    });
    return tmp;
  }
  return array;
};

export const OrdenarArrayObjetos = (objs: any[], campo: string, tipo = 2) => {
  if (tipo === 2) {
    return objs.sort((a, b) => a[campo].localeCompare(b[campo]));
  } else if (tipo === 3) {
    return objs.sort((a, b) => {
      const f1 = moment(a[campo]);
      const f2 = moment(b[campo]);
      if (f1.isAfter(f2)) {
        return 1;
      } else if (f2.isAfter(f1)) {
        return -1;
      } else {
        return 0
      }
    });
  } else {
    return objs.sort((a, b) => (a[campo] > b[campo]) ? 1 : ((b[campo] > a[campo]) ? -1 : 0));
  }
};

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const redondear = (numero: number, decimalPlaces: number) => {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round((numero + Number.EPSILON) * factor) / factor;
}

export const isAllowedUrl = (url: string): boolean => GLOBAL.ALLOWED_URLS.indexOf(url) > -1;

export const isEmail = (correo: string): boolean => correo.match(GLOBAL.FORMATO_EMAIL) !== null && correo.match(GLOBAL.FORMATO_EMAIL) !== undefined;

export enum TIPO_ID_RECEPTOR {
  NIT = 4,
  CUI = 2,
  PASAPORTE = 3
}

export const procesarNIT = (nit: string): string => {
  if (!nit) {
    return null;
  }

  let limpiado = nit.replace(/[^0-9kcf]+/gi, '').toUpperCase();

  if (limpiado.length < 2 || limpiado.length > 12) {
    return null;
  }

  if (limpiado === 'CF') {
    return 'CF';
  }

  const digitoVerificadorNoEsValido = limpiado.slice(-1).match(/[^0-9k]+/gi);
  if (digitoVerificadorNoEsValido !== null && digitoVerificadorNoEsValido !== undefined) {
    return null;
  }

  return limpiado;
}

export const procesarCUI = (cui: string, mupios: Municipio[]): string => {
  if (!cui || mupios?.length === 0) {
    return null;
  }

  let limpiado = cui.replace(/[^0-9]+/gi, '').toUpperCase();

  if (limpiado.length < 12 || limpiado.length > 13) {
    return null;
  }

  const codigo_ubicacion = limpiado.slice(-4);
  const idxMupio = mupios.findIndex(m => m.codigo === codigo_ubicacion);

  return idxMupio >= 0 ? limpiado : null;
}

export const procesarPasaporte = (pasaporte: string) => {
  if (!pasaporte) {
    return null;
  }

  let limpiado = pasaporte.replace(/[^0-9a-z]+/gi, '').toUpperCase();

  if (limpiado.length < 3 || limpiado.length > 18) {
    return null;
  }

  return limpiado;
}

export const seleccionaDocumentoReceptor = (c: Cliente, mupios: Municipio[]): { documento: string, tipo: TIPO_ID_RECEPTOR } => {
  // Tipos de documento: NIT = 4, CUI = 2, Pasaporte = 3
  let documento = procesarNIT(c.nit);
  if (documento) {
    return { documento: documento, tipo: TIPO_ID_RECEPTOR.NIT };
  } else {
    documento = procesarCUI(c.cui, mupios);
    if (documento) {
      return { documento: documento, tipo: TIPO_ID_RECEPTOR.CUI };
    } else {
      documento = procesarPasaporte(c.pasaporte);
      if (documento) {
        return { documento: documento, tipo: TIPO_ID_RECEPTOR.PASAPORTE };
      }
    }
  }
  return null;
}

export const isNotNullOrUndefined = (obj: any): boolean => obj !== null && obj !== undefined;
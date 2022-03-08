import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {

  constructor() { }

  set(indice, objeto, esObjeto = true) {
    if (esObjeto) {
      localStorage.setItem(indice, JSON.stringify(objeto));
    } else {
      localStorage.setItem(indice, objeto);
    }
  }

  get(indice, esObjeto = true) {
    if (esObjeto) {
      return JSON.parse(localStorage.getItem(indice));
    } else {
      return localStorage.getItem(indice);
    }
  }

  clear(indice) { localStorage.removeItem(indice); }

  clearAll() { localStorage.clear(); }

  clearRTStorage() {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.toLowerCase().startsWith('rt')) {
        localStorage.removeItem(key);
      }
    }
  }
}

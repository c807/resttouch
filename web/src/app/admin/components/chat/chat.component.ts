import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL, delay } from '@shared/global';

import { ChatService } from '@admin-services/chat.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  public conversacion: string = '';
  public mensaje: string = '';
  public usuario: string = '';
  public cargando = false;
  public configuracion: any = { w: 100, h: 100, align: 'center', size: 50 };

  private endSubs = new Subscription();

  constructor(
    private bottomSheetRef: MatBottomSheetRef<ChatComponent>,
    private ls: LocalstorageService,
    private chatSrvc: ChatService
  ) { }

  ngOnInit(): void {
    this.usuario = this.ls.get(GLOBAL.usrTokenVar).usuario;
    this.writeMessage(`¡Hola ${this.usuario}! Recuerde que estoy en entrenamiento pero trataré de ayudarle en lo que pueda. ¿Cuál es su pregunta?`);
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  writeMessage = async (msg: string) => {    
    this.conversacion += '<strong>ChefBot:</strong> ';
    for (const char of msg) {
      this.conversacion += char;
      await delay(8);
    }
    this.conversacion += '<hr/>';
  }

  sendQuery = () => {
    this.cargando = true;
    this.updateDivConversacionScroll();
    const msg = this.mensaje.trim();
    this.mensaje = '';
    this.conversacion += `<strong>${this.usuario}:</strong> ${msg}<hr/>`;
    this.updateDivConversacionScroll();
    this.endSubs.add(
      this.chatSrvc.queryChefbot(msg).subscribe(async (res) => {
        this.writeMessage(res.mensaje);
        this.cargando = false;
        this.updateDivConversacionScroll();
      })
    );
  }

  closeChat = () => this.bottomSheetRef.dismiss();

  updateDivConversacionScroll = () => {
    const divConversacion = document.getElementById('divConversacion');
    divConversacion.scrollTop = divConversacion.scrollHeight;
  }

}

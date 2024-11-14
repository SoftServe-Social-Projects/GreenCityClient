import { Injectable, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import SockJS from 'sockjs-client';
import { Stomp, StompSubscription } from '@stomp/stompjs';
import { SocketClientState, SocketConnection } from './socket-state.enum';
import { filter, first, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  connection = {
    greenCity: { url: environment.socket, socket: null, state: null },
    greenCityUser: { url: environment.userSocket, socket: null, state: null }
  };

  constructor() {}

  initiateConnection(connection: SocketConnection = this.connection.greenCity) {
    if (!connection.state) {
      connection.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);
      connection.socket = Stomp.over(() => new SockJS(connection.url));
      connection.socket.connect({}, () => {
        connection.state.next(SocketClientState.CONNECTED);
      });
    }
  }

  connect(connection: SocketConnection): Observable<any> {
    return new Observable((observer) => {
      connection.state.pipe(filter((state) => state === SocketClientState.CONNECTED)).subscribe(() => {
        observer.next(connection.socket);
      });
    });
  }

  onMessage(connection: SocketConnection, topic: string): Observable<any> {
    return this.connect(connection).pipe(
      first(),
      switchMap(
        (client) =>
          new Observable<any>((observer) => {
            const subscription: StompSubscription = client.subscribe(topic, (message) => {
              observer.next(JSON.parse(message.body));
            });
            return () => client.unsubscribe(subscription.id);
          })
      )
    );
  }

  send(connection: SocketConnection, topic: string, payload: any): void {
    this.connect(connection)
      .pipe(first())
      .subscribe((client) => client.send(topic, {}, JSON.stringify(payload)));
  }

  ngOnDestroy() {
    Object.keys(this.connection).forEach((key) => {
      this.connect(this.connection[key])
        .pipe(first())
        .subscribe((client) => client.disconnect(null));
    });
  }
}

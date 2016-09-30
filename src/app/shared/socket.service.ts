import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as io from "socket.io-client";

@Injectable()
export class SocketService {
	private name: string;
	socket: SocketIOClient.Socket;

	constructor() {}

	start(roomId: number, user?: any): Observable<any> {
		this.name = 'Room ' + roomId;
		let socketUrl = "/" + roomId;
		this.socket = io.connect(socketUrl);
		this.socket.on("connect", () => {
			console.log('Connected to ' + this.name);
			this.socket.emit('join', user);
		});
		this.socket.on("disconnect", () => this.disconnect());
		this.socket.on("error", (error: string) => {
			console.log(`ERROR: "${error}" (${socketUrl})`);
		});

		return Observable.create((observer: any) => {
			let events = ['userHasJoined', 'userHasLeft', 'updateCards', 'roomUpdated', 'vote', 'setCard', 'resetVotes', 'forceShow'];
			for (let event of events) {
				this.register(event, observer);
			}
			return () => this.socket.close();
		});
	}

	register(event, observer) {
		this.socket.on(event, item => observer.next({action: event, item: item}));
	}

	emit(type, data?) {
		this.socket.emit(type, data);
	}

	// Handle connection closing
	private disconnect() {
		console.log(`Disconnected from "${this.name}"`);
	}
}
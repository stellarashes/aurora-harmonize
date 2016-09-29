import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as io from "socket.io-client";

@Injectable()
export class SocketService {
	private name: string;
	private host: string = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;
	socket: SocketIOClient.Socket;

	constructor() {}

	start(roomId: number): Observable<any> {
		this.name = 'Room ' + roomId;
		let socketUrl = this.host + "/" + roomId;
		this.socket = io.connect(socketUrl);
		this.socket.on("connect", () => this.connect());
		this.socket.on("disconnect", () => this.disconnect());
		this.socket.on("error", (error: string) => {
			console.log(`ERROR: "${error}" (${socketUrl})`);
		});

		return Observable.create((observer: any) => {
			this.socket.on("userHasJoined", (item: any) => observer.next({ action: "userHasJoined", item: item }) );
			this.socket.on("roomUpdated", (item: any) => observer.next({ action: "roomUpdated", item: item }) );
			return () => this.socket.close();
		});
	}

	emit(type, data) {
		this.socket.emit(type, data);
	}

	// Handle connection opening
	private connect() {
		console.log(`Connected to "${this.name}"`);
	}

	// Handle connection closing
	private disconnect() {
		console.log(`Disconnected from "${this.name}"`);
	}
}
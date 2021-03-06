import {Injectable, Inject} from '@angular/core';
import {Http} from "@angular/http";
import 'rxjs/add/operator/map';

@Injectable()
export class RoomService {

	constructor(@Inject(Http) private http: Http) {
	}

	createRoom(roomName, project, deliveryStatus) {
		return this.http.post('/api/room', {
			roomName: roomName,
			project: project,
			deliveryStatus: deliveryStatus,
		});
	}

	getRoomInfo(roomNumber) {
		return this.http.get('/api/room/' + roomNumber);
	}

	updateRoom(roomNumber) {
		return this.http.post(`/api/room/${roomNumber}/refresh-cards`, {});
	}

	finalizeValue(roomNumber, cardNumber, value) {
		return this.http.post(`/api/room/${roomNumber}/set-final-value`, {cardNumber: cardNumber, value: value});
	}

	getAttachments(roomNumber, cardNumber) {
		return this.http.get(`/api/room/${roomNumber}/attachments/${cardNumber}`);
	}


}

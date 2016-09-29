import {Injectable, Inject} from '@angular/core';
import {Http} from "@angular/http";
import 'rxjs/add/operator/map';

@Injectable()
export class CreateRoomService {

	constructor(@Inject(Http) private http: Http) {
	}

	createRoom(roomName, project) {
		console.log(roomName, roomName);

		return this.http.post('/api/room', {
			roomName: roomName,
			project: project
		});
	}

}

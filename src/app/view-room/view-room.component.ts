import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {RoomService} from "../create-room.service";
import {SocketService} from "../shared/socket.service";
import {CookieService} from "angular2-cookie/services/cookies.service";
import {NameService} from "../name.service";

@Component({
	selector: 'app-view-room',
	templateUrl: './view-room.component.html',
	styleUrls: ['./view-room.component.css'],
	providers: [RoomService, SocketService, CookieService]
})
export class ViewRoomComponent implements OnInit {

	private roomInfo = {cards: [], participants: []};

	constructor(private route: ActivatedRoute,
	            private roomService: RoomService,
	            private socketService: SocketService,
	            private nameService: NameService) {
	}

	ngOnInit() {
		this.route.params
			.subscribe(data => this.initRoom(data['id']));
	}

	initRoom(roomNumber) {
		this.roomService.getRoomInfo(roomNumber)
			.subscribe(data => {
				let result = data.json();
				this.roomInfo = result.room;

				this.socketService.start(roomNumber, {
					name: this.nameService.get(),
					role: result.admin ? 'admin' : 'user'
				})
					.subscribe(data => {
						console.log(data);
						switch (data.action) {
							case 'userHasJoined': {
								if (this.roomInfo.participants.filter(x => x.name === data.item).length === 0)
									this.roomInfo.participants.push(data.item);
								break;
							}
							case 'userHasLeft': {
								this.roomInfo.participants = this.roomInfo.participants.filter(x => x.name !== data.item.name);
								break;
							}
						}
					});
			});
	}

}

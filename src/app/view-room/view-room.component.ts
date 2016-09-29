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
	private roomNumber;
	private roomInfo = {cards: [], participants: [], currentCard: null};
	private isAdmin = false;
	private estimateOptions = [0, 1, 2, 3, 5, 8].map(x => {
		return {display: x, value: x};
	});
	private finalValue: number;

	constructor(private route: ActivatedRoute,
	            private roomService: RoomService,
	            private socketService: SocketService,
	            private nameService: NameService) {
	}

	ngOnInit() {
		this.route.params
			.subscribe(data => {
				this.roomNumber = data['id'];
				this.initRoom();
			});
	}

	initRoom() {
		this.roomService.getRoomInfo(this.roomNumber)
			.subscribe(data => {
				let result = data.json();
				this.roomInfo = result.room;
				this.isAdmin = result.admin;

				this.socketService.start(this.roomNumber, {
					name: this.nameService.get(),
					role: this.isAdmin ? 'admin' : 'user'
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
							case 'updateCards': {
								if (!this.isAdmin) {
									this.roomService.getRoomInfo(this.roomNumber)
										.subscribe(data => {
											this.roomInfo.cards = data.json().room.cards;
										});
								}
								break;
							}
							case 'vote': {
								let target = this.roomInfo.participants.filter(x => x.id === data.item.participant.id);
								if (target.length > 0) {
									let participant = target[0];
									participant.currentVote = data.item.participant.currentVote;
									participant.currentVoteTime = data.item.participant.currentVoteTime;

									if (this.isAdmin) {
										let maxVal = 0;
										this.roomInfo.participants.forEach(x => {if (x.currentVote && x.currentVote > maxVal) maxVal = x.currentVote});
										this.finalValue = maxVal;
									}
								}
								break;
							}
							case 'setCard': {
								this.roomInfo.currentCard = data.item;
								break;
							}
							case 'resetVotes': {
								this.roomInfo.participants.forEach(x => {
									x.currentVote = null;
									x.currentVoteTime = null;
								});
								break;
							}
						}
					});
			});
	}

	updateRoom() {
		this.roomService.updateRoom(this.roomNumber)
			.subscribe(data => {
				this.roomInfo.cards = data.json();
				this.socketService.emit('updateCards');
			});
	}

	vote(value) {
		this.socketService.emit('vote', {value: value});
	}

	setCard(card) {
		if (this.isAdmin && card.number != this.roomInfo.currentCard) {
			this.socketService.emit('setCard', card.number);
			this.resetVotes();
		}
	}

	resetVotes() {
		if (this.isAdmin) {
			this.socketService.emit('resetVotes');
		}
	}

	getCurrentCard() {
		if (this.roomInfo.currentCard) {
			let targetCards = this.roomInfo.cards.filter(x => x.number == this.roomInfo.currentCard);
			if (targetCards.length > 0) {
				return targetCards[0];
			}
		}

		return {};
	}

	finalizeVote() {
		console.log(this.finalValue);
		if (this.isAdmin && typeof(this.finalValue) !== 'undefined') {
			this.roomService.finalizeValue(this.roomNumber, this.finalValue)
				.subscribe(x => console.log(x.json()));
		}
	}

}

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {RoomService} from "../create-room.service";
import {SocketService} from "../shared/socket.service";
import {CookieService} from "angular2-cookie/services/cookies.service";
import {NameService} from "../name.service";
import * as moment from "moment";

declare var $: any;

@Component({
	selector: 'app-view-room',
	templateUrl: './view-room.component.html',
	styleUrls: ['./view-room.component.css'],
	providers: [RoomService, SocketService, CookieService]
})
export class ViewRoomComponent implements OnInit {
	private name;
	private roomNumber;
	private roomInfo = {
		cards: [],
		participants: [],
		currentCard: null,
		forceShow: false,
		startedTime: null,
		mingleProject: null
	};
	private isAdmin = false;
	private estimateOptions = [1, 2, 3, 5, 8].map(x => {
		return {display: x, value: x};
	});
	private finalValue: number;
	private needsName = true;
	private timeString: string;
	private hasAlerted = false;
	private myVote = null;

	constructor(private route: ActivatedRoute,
	            private roomService: RoomService,
	            private socketService: SocketService,
	            private nameService: NameService) {
	}

	ngOnInit() {
		this.name = this.nameService.get();
		this.needsName = !this.name;
		if (!this.needsName) {
			this.loadParams();
		}


		setInterval(() => {
			if (this.roomInfo.startedTime) {
				this.timeString = this.timeElapsed();
			}
		}, 1000);
	}

	updateName() {
		this.nameService.set(this.name);
	}

	keydown(event) {
		if (event.keyCode === 13)
			this.validateName();
	}

	validateName() {
		if (this.name) {
			this.updateName();
			this.needsName = false;
			this.loadParams();
		}
	}

	loadParams() {
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
				if (typeof (this.roomInfo.startedTime) === 'string') {
					this.roomInfo.startedTime = moment(this.roomInfo.startedTime);
				}
				this.isAdmin = result.admin;

				this.socketService.start(this.roomNumber, {
					name: this.nameService.get(),
					role: this.isAdmin ? 'admin' : 'user'
				})
					.subscribe(data => {
						console.log(data);
						switch (data.action) {
							case 'userHasJoined': {
								if (this.roomInfo.participants.filter(x => x.name === data.item.name).length === 0)
									this.roomInfo.participants.push(data.item);
								this.notify(`${data.item.name} has joined the room.`);
								break;
							}
							case 'userHasLeft': {
								this.roomInfo.participants = this.roomInfo.participants.filter(x => x.name !== data.item.name);
								this.notify(`${data.item.name} has left the room.`);
								break;
							}
							case 'updateCards': {
								if (!this.isAdmin) {
									this.roomService.getRoomInfo(this.roomNumber)
										.subscribe(data => {
											this.roomInfo.cards = data.json().room.cards;
										});
									this.notify(`Cards have been refreshed.`);
								}
								break;
							}
							case 'vote': {
								let target = this.roomInfo.participants.filter(x => x.id === data.item.participant.id);
								if (target.length > 0) {
									let participant = target[0];
									this.notify(`${participant.name} has voted.`);
									participant.currentVote = data.item.participant.currentVote;
									participant.currentVoteTime = data.item.participant.currentVoteTime;

									if (this.isAdmin) {
										let maxVal = 0;
										this.roomInfo.participants.forEach(x => {
											if (x.currentVote && x.currentVote > maxVal) maxVal = x.currentVote
										});
										this.finalValue = maxVal;
									}
								}
								break;
							}
							case 'setCard': {
								this.notify(`A new active story has been set.`);
								this.roomInfo.currentCard = data.item;
								break;
							}
							case 'resetVotes': {
								this.roomInfo.participants.forEach(x => {
									x.currentVote = null;
									x.currentVoteTime = null;
								});
								this.roomInfo.forceShow = false;
								this.roomInfo.startedTime = null;
								this.hasAlerted = false;
								this.myVote = null;
								break;
							}
							case 'forceShow': {
								this.roomInfo.forceShow = true;
								break;
							}
							case 'setFinalValue': {
								this.notify(`Card ${data.item.cardNumber} has been finalized to ${data.item.value}`);
								for (let card of this.roomInfo.cards) {
									if (card.number == data.item.cardNumber) {
										card.finalValue = data.item.value;
									}
								}
								break;
							}
							case 'startVotes': {
								this.notify(`Voting has started.`);
								this.roomInfo.startedTime = moment(data.item);
								break;
							}
						}
					});
			});
	}

	notify(message: string, options?) {
		options = options || {};
		options = Object.assign({}, options, {
			placement: {
				from: "bottom",
				align: "left",
			},
			delay: 3000,

		});
		$.notify({
			message: message
		}, options);
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
		this.myVote = value;
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

		return {
			name: "Waiting",
			description: "Waiting on Moderator to choose a card",
		};
	}

	finalizeVote() {
		if (this.isAdmin && typeof(this.finalValue) !== 'undefined') {
			this.roomService.finalizeValue(this.roomNumber, this.roomInfo.currentCard, this.finalValue)
				.subscribe(data => console.log(data));
		}
	}

	shouldShowVotes() {
		let votedCount = this.roomInfo.participants.filter(x => this.hasParticpantVoted(x)).length;
		let userCount = this.roomInfo.participants.filter(x => x.role === 'user').length;
		return this.isAdmin || this.roomInfo.forceShow ||
			votedCount >= userCount;
	}

	forceShow() {
		this.socketService.emit('forceShow');
	}

	hasParticpantVoted(participant) {
		return participant.currentVote !== null && typeof(participant.currentVote) !== 'undefined'
	}

	startVotes() {
		this.socketService.emit('startVotes');
	}

	timeElapsed() {
		let diff = moment().utc().diff(this.roomInfo.startedTime);
		return moment(diff).format('mm:ss');
	}

}

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {RoomService} from "../create-room.service";
import {SocketService} from "../shared/socket.service";
import {CookieService} from "angular2-cookie/services/cookies.service";
import {NameService} from "../name.service";
import * as moment from "moment";

declare var $: any;
declare var c3: any;

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
	private self;
	private previewCard = null;

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

		window.addEventListener('keyup', event => this.keyup(event));

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

	keyup(event) {
		let currentTag = document.activeElement.tagName;
		if (currentTag && currentTag.toLowerCase() === 'input') {
			return;
		}
		let input = -1;
		if (event.keyCode >= 48 && event.keyCode <= 57) {
			input = event.keyCode - 48;
		} else if (event.keyCode >= 96 && event.keyCode <= 105) {
			input = event.keyCode - 96;
		}

		if (input > -1 && this.estimateOptions.find(x => x.value === input)) {
			this.vote(input);
		}
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

	toggleCanVote(participant) {
		if (this.isAdmin) {
			participant.canVote = !participant.canVote;
			this.socketService.emit('updateUser', participant);
		}
	}

	initRoom() {
		this.roomService.getRoomInfo(this.roomNumber)
			.subscribe(data => {
				let result = data.json();
				this.roomInfo = result.room;
				this.loadAttachmentsIfNeeded(this.getCurrentCard());

				if (typeof (this.roomInfo.startedTime) === 'string') {
					this.roomInfo.startedTime = moment(this.roomInfo.startedTime);
				}
				this.isAdmin = result.admin;

				this.socketService.start(this.roomNumber, {
					name: this.nameService.get(),
					role: this.isAdmin ? 'admin' : 'user',
					canVote: !this.isAdmin
				})
					.subscribe(data => {
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
											this.loadAttachmentsIfNeeded(this.getCurrentCard());
										});
									this.notify(`Cards have been refreshed.`);
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
										this.roomInfo.participants.forEach(x => {
											if (x.currentVote && x.currentVote > maxVal) maxVal = x.currentVote
										});
										this.finalValue = maxVal;
									}

									this.drawDonutIfVoted();
								}
								break;
							}
							case 'setCard': {
								this.notify(`A new active story has been set.`);
								this.roomInfo.currentCard = data.item;
								this.loadAttachmentsIfNeeded(this.getCurrentCard());
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
								this.drawDonutIfVoted();
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
							case 'identity': {
								this.self = data.item;
								break;
							}
							case 'updateUser': {
								let participant = this.roomInfo.participants.find(x => x.id === data.item.id);
								if (participant) {
									Object.assign(participant, data.item);
								}
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

	drawDonutIfVoted() {
		if (this.hasFinishedVoting()) {
			let counts = new Map<number, any[]>();
			this.roomInfo.participants.forEach(x => {
				if (x.canVote) {
					if (!counts.has(x.currentVote)) {
						counts.set(x.currentVote, [x]);
					} else {
						counts.get(x.currentVote).push(x);
					}
				}
			});
			let entries = Array.from(counts.entries());
			entries.sort((x, y) => (x[0] - y[0]));
			let data = {
				columns: entries.map(x => [x[0] + ' - ' + x[1].map(x => x.name).join(', '), x[1].length]),
				type: 'donut',
			};
			let c3Options = {
				data: data,
				donut: {
					title: 'Vote Results',
					label: {
						format: (value, ratio, id) => {
							let offset = id.indexOf(' - ');
							if (offset > -1) {
								return id.substr(0, offset);
							}
						},
					},
				}
			};
			c3.generate(c3Options);
		}
	}

	loadAttachmentsIfNeeded(card) {
		if (!card || !card.number) {
			return;
		}
		if (card.description && card.description.match(/![\w,\s\-.]+!/)) {
			if (!card.attachments) {
				this.roomService.getAttachments(this.roomNumber, card.number)
					.subscribe(data => {
						card.attachments = data.json();
						this.affixAttachments(card);
					});
			} else {
				this.affixAttachments(card);
			}
		}
	}

	affixAttachments(card) {
		for (let attachment of card.attachments) {
			let regex = new RegExp('!' + this.escapeRegExp(attachment.fileName) + '!', 'g');
			card.description = card.description.replace(regex, `<img src="${attachment.url}" />`);
		}
	}

	escapeRegExp(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	updateRoom() {
		this.roomService.updateRoom(this.roomNumber)
			.subscribe(data => {
				this.roomInfo.cards = data.json();
				this.loadAttachmentsIfNeeded(this.getCurrentCard());
				this.socketService.emit('updateCards');
			});
	}

	canVote(notify) {
		if (!this.self || !this.self.id) {
			if (notify)
				this.notify('Page was incorrectly loaded; please try refreshing.', {type: 'danger'});
			return false;
		}
		let participant = this.roomInfo.participants.find(x => x.id === this.self.id);
		if (!participant) {
			if (notify)
				this.notify('Unable to find user in participant list; please refresh the page.', {type: 'warning'});
			return false;
		}
		return participant.canVote;
	}

	vote(value) {
		if (!this.canVote(true)) {
			this.notify('You are currently a spectator and cannot vote.');
		} else {
			if (value !== this.myVote) {
				if (!this.roomInfo.startedTime) {
					this.notify('Waiting for voting to start.');
					return;
				}

				this.socketService.emit('vote', {value: value});
				this.myVote = value;
			}
		}


	}

	setCard(card) {
		if (card.number != this.roomInfo.currentCard) {
			if (this.isAdmin) {
				this.socketService.emit('setCard', card.number);
				this.resetVotes();
			} else {
				this.previewCard = card;
				this.loadAttachmentsIfNeeded(card);
			}
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
		return this.isAdmin || this.roomInfo.forceShow ||
			this.hasFinishedVoting();
	}

	hasFinishedVoting() {
		let voterList = this.roomInfo.participants.filter(x => x.canVote);
		let unvotedList = this.roomInfo.participants.filter(x => x.canVote && !this.hasParticipantVoted(x));
		return voterList.length > 0 && unvotedList.length === 0;
	}

	forceShow() {
		this.socketService.emit('forceShow');
	}

	hasParticipantVoted(participant) {
		return participant.currentVote !== null && typeof(participant.currentVote) !== 'undefined'
	}

	startVotes() {
		this.socketService.emit('startVotes');
	}

	timeElapsed() {
		let diff = moment().utc().diff(this.roomInfo.startedTime);
		return moment(diff).format('mm:ss');
	}

	clearPreview() {
		this.previewCard = null;
	}

}

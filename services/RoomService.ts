import Namespace = SocketIO.Namespace;
import {Room} from "../models/Room";
import {SocketService} from "./SocketService";
import {RoomParticipant} from "../models/RoomParticipant";
import {MingleService} from "./MingleService";
import {Container} from "typescript-ioc";
export class RoomService {
	private io;
	private namespace: string;
	private room: Room;
	private mingleService: MingleService;

	public async initialize(room: Room, socket: SocketService) {
		this.room = room;
		this.namespace = '/' + room.roomNumber;
		this.io = socket.createNamespace(this.namespace);
		this.mingleService = Container.get(MingleService);
		return Promise.all([
			this.setupIO(),
			this.getCards(),
		]);
	}

	public getRoomInfo() {
		return Promise.resolve(this.room);
	}

	public async updateCards() {
		return this.getCards();
	}

	public joinRoom(user: any) {
		let participant = new RoomParticipant();
		participant.name = user.name;
		participant.role = user.role;
		participant.canVote = user.canVote;
		this.room.participants.push(participant);
		this.broadcastToRoom('userHasJoined', participant); // won't finish by return but that's desired behavior
		return participant;
	}

	private async getParticipant(user: any): Promise<RoomParticipant> {
		let target = this.room.participants.filter(x => x.name === user.name);
		if (target && target.length) {
			return Promise.resolve(target[0]);
		}
		return Promise.resolve(null);
	}

	public async leaveRoom(user: any) {
		this.room.participants = this.room.participants.filter(x => x.name !== user.name);
		await this.broadcastToRoom('userHasLeft', user);
	}

	private async getCards() {
		this.room.cards = await this.mingleService.getCards(this.room.mingleProject);
		return this.room.cards;
	}

	private async setupIO() {
		this.io.on('connection', socket => {
			let connectionUser;
			socket.join(this.namespace);
			socket.on('join', user => {
				connectionUser = this.joinRoom(user);
				socket.emit('identity', connectionUser);
			});
			socket.on('disconnect', () => {
				if (connectionUser) {
					this.leaveRoom(connectionUser);
				}
			});
			socket.on('updateCards', () => {
				this.broadcastToRoom('updateCards');
			});
			socket.on('vote', vote => {
				this.getParticipant(connectionUser)
					.then(participant => {
						participant.currentVote = vote.value;
						participant.currentVoteTime = new Date();
						this.broadcastToRoom('vote', {
							participant: participant,
						});
					});
			});
			socket.on('setCard', number => {
				this.room.currentCard = number;
				this.broadcastToRoom('setCard', this.room.currentCard);
			});
			socket.on('resetVotes', () => {
				this.room.participants.forEach(x => {
					x.currentVote = null;
					x.currentVoteTime = null;
				});
				this.room.forceShow = false;
				this.room.startedTime = null;
				this.broadcastToRoom('resetVotes');
			});
			socket.on('forceShow', () => {
				this.room.forceShow = true;
				this.broadcastToRoom('forceShow');
			});
			socket.on('startVotes', () => {
				this.room.startedTime = new Date().toISOString();
				this.broadcastToRoom('startVotes', this.room.startedTime);
			});
			socket.on('updateUser', user => {
				let participant = this.room.participants.find(x => x.id === user.id);
				if (participant) {
					for (let key in user) {
						if (participant.hasOwnProperty(key) && user.hasOwnProperty(key)) {
							participant[key] = user[key];
						}
					}

					this.broadcastToRoom('updateUser', participant);
				}
			});
		});
	}

	public broadcastToRoom(msg: string, param?: any) {
		this.io.to(this.namespace).emit(msg, param);
	}

	public async setFinalValue(cardNumber: number, value: number) {
		await this.mingleService.setEstimate(this.room.mingleProject, cardNumber, value);
		this.broadcastToRoom('setFinalValue', {
			cardNumber: cardNumber,
			value: value
		});
		for (let card of this.room.cards) {
			if (card.number == cardNumber) {
				card.finalValue = value;
				break;
			}
		}

		return {
			status: 'success'
		};
	}

	public async getCardAttachments(cardNumber: number) {
		let result = await this.mingleService.getAttachments(this.room.mingleProject, cardNumber);
		let card = this.room.cards.find(x => x.number === cardNumber);
		if (card) {
			card.attachments = result;
		}

		return result;
	}
}
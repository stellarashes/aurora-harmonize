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

	public async initialize(room: Room, socket: SocketService) {
		this.room = room;
		this.namespace = '/' + room.id;
		this.io = socket.createNamespace(this.namespace);
		return Promise.all([
			this.setupIO(),
			this.getCards(),
		]);
	}

	public getRoomInfo() {
		return Promise.resolve(this.room);
	}

	public async joinRoom(user: any) {
		let participant = new RoomParticipant();
		participant.name = user.name;
		participant.socketSessionId = user.id;
		participant.role = user.role;
		this.room.participants.push(participant);
		this.room.save();
	}

	private async getCards() {
		let service = Container.get(MingleService);
		this.room.cards = await service.getCards(this.room.mingleProject);
	}

	private async setupIO() {
		this.io.on('connection', socket => {
			socket.join(this.namespace);
			socket.on('join', (id, user) => {
				user.id = id;
				this.io.to(this.namespace).emit('userHasJoined', user);
				this.joinRoom(user);
			});
			socket.on('vote', (id, vote) => {
				vote.id = id;
				let participant = this.getParticipantById(id);
				if (!participant) {
					participant.currentVote = vote.value;
					this.io.to(this.namespace).emit('userHasVoted', {
						id: id,
						name: participant.name,
						vote: vote
					});
				}
			});
			socket.on('startVote', (id, card) => {

			});
			socket.on('finish', (id, finishOptions) => {

			});
		});
	}

	private getParticipantById(id: string) {
		let candidates = this.room.participants.filter(x => x.socketSessionId === id);
		if (candidates && candidates.length) {
			return candidates[0];
		} else {
			return null;
		}
	}
}
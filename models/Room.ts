import {Table, Column, HasMany, DataModel} from "ts-chassis";
import {DataTypes} from "sequelize";
import {RoomParticipant} from "./RoomParticipant";
import {Card} from "./Card";

@Table()
export class Room extends DataModel {
	id: string;

	@Column()
	name: string;

	@Column()
	roomNumber: number;

	@Column()
	mingleProject: string;

	@Column()
	deliveryStatus: string;

	@HasMany(Card)
	cards: Card[];

	currentCard: number;
	forceShow: boolean;

	@HasMany(RoomParticipant)
	participants: RoomParticipant[];

	constructor()
	{
		super();
		this.roomNumber = Math.floor(Math.random() * 100000);
		this.participants = [];
		this.cards = [];
	}
}
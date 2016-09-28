import {Table, Column, HasMany, DataModel} from "ts-chassis";
import {DataTypes} from "sequelize";
import {RoomParticipant} from "./RoomParticipant";

@Table()
export class Room extends DataModel {
	id: string;

	@HasMany(RoomParticipant)
	participants: RoomParticipant[];
}
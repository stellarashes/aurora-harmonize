import {DataModel, Table, Column} from "ts-chassis";

@Table({
	indexes: [
		{
			unique: true,
			fields: ['project', 'number']
		}
	]
})
export class Card extends DataModel {

	@Column()
	finalValue: string;

	type: string;
	description: string;

	@Column()
	project: string;

	@Column()
	number: number;

	rank: string;
	tags: string[];

	public static fromXMLTranslatedObject(object): Card {
		let card = new Card();
		card.type = object.card_type[0].name[0];
		card.description = object.description[0];
		card.project = object.project[0].identifier[0];
		card.number = parseInt(object.number[0]._);
		card.rank = object.project_card_rank[0];
		card.tags = object.tags;

		return card;
	}
}
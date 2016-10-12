import {DataModel, Table, Column, HasMany} from "ts-chassis";
import {Attachment} from "./Attachment";

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
	finalValue: number;

	type: string;
	description: string;

	@Column()
	project: string;

	@Column()
	number: number;

	@HasMany(Attachment)
	attachments: Attachment[];

	name: string;
	rank: string;
	tags: string[];

	public static fromXMLTranslatedObject(object): Card {
		let card = new Card();
		card.type = object.card_type[0].name[0];
		card.description = object.description[0];
		card.name = object.name[0];
		card.project = object.project[0].identifier[0];
		card.number = parseInt(object.number[0]._);
		card.rank = object.project_card_rank[0];
		card.tags = object.tags;

		for (let property of object.properties[0].property) {
			if (property.name[0] === 'Estimate') {
				if (typeof(property.value[0]) === 'string')
					card.finalValue = parseInt(property.value[0]);
				else if (typeof(property.value[0]) === 'number')
					card.finalValue = property.value[0];
				break;
			}
		}
		return card;
	}
}
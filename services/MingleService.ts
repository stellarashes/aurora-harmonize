import {Card} from "../models/Card";
import requestPromise = require("request-promise");
import {parseString} from "xml2js";
import {Attachment} from "../models/Attachment";
export class MingleService {
	public async getCards(project: string, filters?: string[]): Promise<Card[]> {
		let result = await this.mingleRequest({
			uri: `/api/v2/projects/${project}/cards.xml`,
			qs: {
				"filters": filters || ['[Type][is][Story]', '[Sprint][is][(Backlog)]', '[Delivery Status][is][Next for Estimation (Highest Priority)]'],
				"sort": "project_card_rank",
			},
			qsStringifyOptions: {
				arrayFormat: 'brackets',
			},
		});

		return new Promise<Card[]>((resolve, reject) => {
			parseString(result, (err, parseResult) => {
				if (err) {
					reject(err);
				} else {
					let translatedCards = parseResult.cards.card.map(x => Card.fromXMLTranslatedObject(x));
					resolve(translatedCards);
				}
			});
		});
	}

	public async setEstimate(project: string, cardNumber: number, estimate: number): Promise<Card> {
		return this.mingleRequest({
			method: 'put',
			uri: `/api/v2/projects/${project}/cards/${cardNumber}.xml`,
			qs: {
				"card[properties][][name]": "Estimate",
				"card[properties][][value]": estimate,
			},
		});
	}

	public async getAttachments(project: string, cardNumber: number): Promise<Attachment[]> {
		let result = await this.mingleRequest({
			method: 'get',
			uri: `/api/v2/projects/${project}/cards/${cardNumber}/attachments.xml`,
		});
		return new Promise<Attachment[]>((resolve, reject) => {
			parseString(result, (err, parseResult) => {
				if (err) {
					reject(err);
				} else {
					let translatedAttachments = parseResult.attachments.attachment.map(x => Attachment.fromXMLObject(x));
					resolve(translatedAttachments);
				}
			});
		});
	}

	private async mingleRequest(options) {
		let requestOptions = Object.assign({
			baseUrl: 'https://careerbuilder.mingle-api.thoughtworks.com',
			headers: {
				Authorization: 'Basic ' + new Buffer(process.env.MINGLE_USER + ':' + process.env.MINGLE_PASS).toString('base64')
			}
		}, options);

		return requestPromise(requestOptions);
	}

}

import {Card} from "../models/Card";
import requestPromise = require("request-promise");
import {parseString} from "xml2js";
export class MingleService {
	public async getCards(project: string, filters?: string[]): Promise<Card[]> {
		let result = await this.mingleRequest({
			uri: '/api/v2/projects/' + project + '/cards.xml',
			qs: {
				"filters": filters || ['[Type][is][Story]', '[Sprint][is][(Backlog)]', '[Delivery Status][is][Next for Estimation (Highest Priority)]']
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
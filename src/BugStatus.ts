import * as https from 'https';

import { IMessasgeAttachment } from './common';

const KEYS = require('../config/keys.json');

export function issueStatus(number: number): Promise<IMessasgeAttachment> {
  return new Promise((resolve, reject) => {
    const req = https.get({
      path: `/repos/IrisAmp/RegexBot/issues/${number}`,
      host: 'api.github.com',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${KEYS.github}`,
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'User-Agent': 'node.js',
      }
    }, (response) => {
      if (response.statusCode === 200 ||
        response.statusCode === 201) {
        response.setEncoding('utf8');
        let raw = '';
        response.on('data', (chunk) => {
          raw += chunk;
        });
        response.on('end', () => {
          resolve(JSON.parse(raw));
        });
        response.on('error', (error) => {
          reject(error);
        });
      } else {
        reject(new Error(`${response.statusCode}: ${response.statusMessage}`));
      }
    });
  }).then(formatResponse);
}

function formatResponse(raw: any): IMessasgeAttachment {
  let result: IMessasgeAttachment = {
    fallback: raw.title,
    title: `#${raw.number}: ${raw.title}`,
    text: raw.body,
    title_link: raw.html_url,
    color: raw.state === 'open' ? 'good' : 'bad',
    footer: `Created at ${raw.created_at}. Updated at ${raw.updated_at}.`,
    fields: [
      {
        title: 'State',
        value: raw.state,
        short: true,
      },
      {
        title: 'Assignee',
        value: raw.assignee && raw.assignee.login ? raw.assignee.login : 'None',
        short: true,
      },
      {
        title: 'Tags',
        value: raw.labels && raw.labels.length ? (raw.labels as any[]).map((label) => { return `${label.name}`; }).join(', ') : 'None',
        short: true,
      },
      {
        title: 'Pull Request',
        value: raw.pull_request ? raw.pull_request.html_url : 'n/a',
        short: true,
      }
    ]
  };

  if (raw.assignee && raw.assignee.login) {
    result.author_name = `Assigned to ${raw.assignee.login}`;
    result.author_link = raw.assignee.html_url;
    result.author_icon = raw.assignee.avatar_url;
  }

  if (raw.milestone && raw.milestone.due_on) {
    result.fields.push({
      title: 'Due on',
      value: raw.milestone.due_on,
      short: false,
    });
  }

  return result;
}

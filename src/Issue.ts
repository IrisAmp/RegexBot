import * as http from 'http';
import * as https from 'https';

import { parseHttpResponse, formatBotResponse, IMessasgeAttachment } from './common';

const KEYS = require('../config/keys.json');

interface IGithubIssue {
  title: string,
  body?: string,
  assignee?: string,
  milestone?: number,
  labels?: string[],
  assignees?: string[],
}

export function fileIssue(response, convo, bot): void {
  convo.setTimeout(300000);
  bot.api.users.info({ user: response.user }, (error, response) => {
    if (!error) {
      askIssueName(response, convo, bot, response.user);
    } else {
      convo.say(`ERROR LOADING USER INFO: ${error}`);
      convo.say(`CHECK LOGS`);
      console.error(error);
      convo.next();
    }
  });
}

function askIssueName(response, convo, bot, user, data: any = {}) {
  convo.ask(formatBotResponse('ENTER ISSUE NAME'), (response, convo) => {
    data.name = response.text;
    askIssueBody(response, convo, bot, user, data);
  });
  convo.next();
}

function askIssueBody(response, convo, bot, user, data) {
  convo.ask(formatBotResponse('ENTER ISSUE DESCRIPTION'), (response, convo) => {
    data.description = response.text;
    confirmIssue(response, convo, bot, user, data);
  });
  convo.next();
}

function confirmIssue(response, convo, bot, user, data) {
  const issueBodyAttachment: IMessasgeAttachment = {
    fallback: 'Issue',
    title: data.name,
    text: data.description,
    color: `#${user.color}`,
    fields: [
      {
        title: 'Created by',
        value: `${user.name} (${user.profile.real_name_normalized})`,
        short: true,
      }
    ]
  }
  convo.ask({
    text: formatBotResponse('CONFIRM ISSUE (YES/NO)'),
    attachments: [issueBodyAttachment]
  }, [
      {
        pattern: bot.utterances.yes,
        callback: (response, convo) => {
          convo.say(formatBotResponse(`SENDING...`));
          sendIssueToGithub({
            title: data.name,
            body: `Filed by IrisAmpBot on behalf of ${user.name} (${user.profile.real_name_normalized}).\r\n\r\n${data.description}`,
            labels: ['bot'],
          }).then((response) => {
            const responseAttachment: IMessasgeAttachment = {
              fallback: 'New issue created.',
              color: 'good',
              pretext: 'New issue created.',
              title: response.title,
              title_link: response.html_url,
              text: response.body,
              footer: `Created at ${response.created_at}`,
              fields: [
                {
                  title: 'Number',
                  value: response.number,
                  short: true,
                },
                {
                  title: 'Labels',
                  value: (response.labels || [] as any[]).map(v => { return v.name; }).join(),
                  short: true,
                }
              ]
            };
            convo.say({
              attachments: [responseAttachment]
            });
            convo.next();
          }).catch((reason) => {
            convo.say(formatBotResponse(`ERROR SENDING ISSUE TO GITHUB: ${reason}`));
            convo.next();
          });
        }
      },
      {
        pattern: bot.utterances.no,
        callback: (response, convo) => {
          convo.say(formatBotResponse(`ISSUE NOT FILED`));
          convo.next();
        }
      },
      {
        default: true,
        callback: (response, convo) => {
          convo.say(formatBotResponse(`ERROR: UNRECOGNIZED DIRECTIVE ${response.text}`));
          convo.say(formatBotResponse(`CONFIRM ISSUE (YES/NO)`));
          convo.silentRepeat();
          convo.next();
        }
      }
    ]);
  convo.next();
}

export function sendIssueToGithub(issue: IGithubIssue): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request({
      method: 'POST',
      path: '/repos/IrisAmp/RegexBot/issues',
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
    req.end(JSON.stringify(issue));
  });
}

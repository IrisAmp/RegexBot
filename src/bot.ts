import { getSRDAttachment } from './SRD';
import { getWolframAttachment } from './Wolfram';

const Botkit = require('botkit');
const KEYS = require('../config/keys.json');

if (!KEYS.slack) {
  console.error('No bot token.');
  process.exit(1);
}

function formatBotResponse(msg: string): string {
  return `\`${msg}\``;
}

const controller = Botkit.slackbot({
  require_delivery: true,
  retry: Infinity,
  stats_optout: true,
  json_file_store: './data',
});

controller.spawn({
  token: KEYS.slack
}).startRTM((error, bot, payload) => {
  if (error) { throw new Error(error); }
});

controller.on(['direct_message','direct_mention','mention'], (bot, message) => {
  bot.startConversation(message, (error, convo) => {
    convo.ask(formatBotResponse(`CONNECTION TO [${message.user}] OPENED. STATE QUERY.`), [
      {
        pattern: `purpose`,
        callback: (response, convo) => {
          convo.say(formatBotResponse('SUCK IT, @tcp'));
          convo.next();
        }
      },
      {
        pattern: `help`,
        callback: (response, convo) => {
          convo.say(formatBotResponse('ERROR: I AM NOT PROGRAMMED FOR COMPASSION.'));
          convo.next();
        }
      },
      {
        pattern: `repo`,
        callback: (response, convo) => {
          convo.say(formatBotResponse('https://github.com/IrisAmp/RegexBot'));
          convo.next();
        }
      },
      {
        pattern: /srd\s+(.*)$/i,
        callback: (response, convo) => {
          convo.say(formatBotResponse('LOADING...'));
          getSRDAttachment(response.match[1]).then((attachment) => {
            convo.say({ attachments: [attachment] });
            convo.next();
          }).catch((reason) => {
            convo.say(formatBotResponse(`ERROR: ${reason}`));
            convo.next();
          });
        }
      },
      {
        pattern: /ask\s+(.*)$/i,
        callback: (response, convo) => {
          convo.say(formatBotResponse('LOADING...'));
          getWolframAttachment(response.match[1]).then((attachment) => {
            convo.say({ attachments: [attachment] });
            convo.next();
          }).catch((reason) => {
            convo.say(formatBotResponse(`ERROR: ${reason}`));
            convo.next();
          });
        }
      },
      {
        default: true,
        callback: (response, convo) => {
          convo.say(formatBotResponse(`ERROR: UNRECOGNIZED QUERY ${response.text}`));
          convo.next();
        }
      }
    ]);
    convo.setTimeout(30000);
  });
});

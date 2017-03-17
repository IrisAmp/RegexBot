import { getSRDAttachment } from './SRD';
import { getWolframAttachment } from './Wolfram';
import { getRollAttachment } from './Dice';
import { manpage } from './Manpage';

const Botkit = require('botkit');
const KEYS = require('../config/keys.json');

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

controller.hears(`man (\\d+ )?regex-bot`, ['direct_message', 'ambient'], manpage);
controller.on(['direct_message'], (bot, message) => {
  if (/man ?(\d+ )?(regex-bot)?/i.test(message.text)) {
    manpage(bot, message);
  } else {
    initiateConversation(bot, message);
  }
});
controller.on(['direct_mention', 'mention'], initiateConversation);

function initiateConversation(bot, message): void {
  bot.startConversation(message, (error, convo) => {
    convo.ask(formatBotResponse(`CONNECTION TO [${message.user}] OPENED. STATE DIRECTIVE.`), [
      {
        pattern: /^purpose$/i,
        callback: (response, convo) => {
          convo.say(formatBotResponse('SUCK IT, @tcp'));
          convo.next();
        }
      },
      {
        pattern: /^help$/i,
        callback: (response, convo) => {
          convo.say(formatBotResponse('ERROR: I AM NOT PROGRAMMED FOR COMPASSION.'));
          convo.next();
        }
      },
      {
        pattern: /^version$/i,
        callback: (response, convo) => {
          convo.say(formatBotResponse('slack-regex-bot@latest'));
          convo.next();
        }
      },
      {
        pattern: /^repo$/i,
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
        pattern: /roll\s+(.*)$/i,
        callback: (response, convo) => {
          getRollAttachment(response.match[1]).then((attachment) => {
            convo.say({ attachments: [attachment] });
            convo.next();
          }).catch((reason) => {
            convo.say(formatBotResponse(`ERROR: ${reason}`));
            convo.next();
          });
        }
      },
      {
        pattern: `bork`,
        callback: (response, convo) => {
          convo.say('Bork bork bork!');
          convo.say(':ohmydog:');
          convo.next();
        }
      },
      {
        default: true,
        callback: (response, convo) => {
          convo.say(formatBotResponse(`ERROR: UNRECOGNIZED DIRECTIVE ${response.text}`));
          convo.next();
        }
      }
    ]);
    convo.setTimeout(30000);
  });
}

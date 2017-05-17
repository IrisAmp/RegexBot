import { Dice } from 'dicelang';

import { IMessasgeAttachment } from './common';

let crypto;
try {
  crypto = require('crypto');
} catch (error) {
  console.error(error);
}

export function getRollAttachment(query: string): Promise<IMessasgeAttachment> {
  if (query.length > 1024) {
    return Promise.reject(new Error('413: Payload Too Large'));
  } else if (crypto) {
    return rollDice(query);
  } else {
    return Promise.reject(new Error('HOST DOES NOT HAVE SUITABLE RNG'));
  }
}

function rollDice(query: string): Promise<IMessasgeAttachment> {
  return new Promise((res, rej) => {
    const dice = new Dice(query);
    dice.roll();
    const result: IMessasgeAttachment = {
      fallback: String(dice.result),
      title: `Roll ${query}`,
      footer: `https://wiki.roll20.net/Dice_Reference`,
      mrkdwn_in: ['fields'],
      fields: [
        {
          title: `Result`,
          value: `\`${dice.result}\``,
          short: false,
        },
        {
          title: `Normalized notation`,
          value: `\`${dice.toString()}\``,
          short: true,
        },
        {
          title: `Description`,
          value: `${dice.toStringPlaintext()}`,
          short: true,
        },
        {
          title: `Rolls`,
          value: `${dice.rolls}`,
          short: true,
        },
        {
          title: `Rolls before modifiers`,
          value: `${dice.rawRolls}`,
          short: true,
        },
      ],
    };
    res(result);
  });
}

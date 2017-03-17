
const m1 = `
\`\`\`
regex-bot(1)
NAME
  Regex Bot - A bot that has almost nothing to do with RegEx'es.

SYNOPSIS
  @regex-bot
  [directive]

DESCRIPTION
  Start a conversation with the bot using a direct mention (ie: say "@regex-bot"). It will ACK you and then you can use any of the following directives:
    purpose
      Display the bot's purpose.
    help
      Display help information.
    version
      Display version information.
    repo
      Display the bot's source repository.
    bug|issue|feature-request
      Start the Github issue dialog.
    srd [query]
      Lookup an entry in the Systems Reference Document (SRD).
    ask [query]
      Ask a natural language query using the Wolfram|Alpha API.
    roll [query]
      Roll dice using Roll20 syntax.
      See also: man 2 regex-bot
\`\`\`
`;

const m2 = `
\`\`\`
regex-bot(2)
ROLL
  regex-bot uses Roll20 syntax for dice rolls. See also: https://wiki.roll20.net/Dice_Reference

TYPES OF DICE
  Basic Roll: [N]d[X]
    Rolls N traditional dice with X sides per die. N must be greater than or equal to 0 and X must be greater than or equal to 1. The values of N and X may be expressions if they are enclosed in parentheses, for example (1+2)d(10*2).
  Fate/Fudge Roll: [N]dF
    Rolls N Fate/Fudge dice. These dice have three sides with values of -1, 0, and 1.
  
ROLL MODIFIERS
  NOT IMPLEMENTED.
\`\`\`
`;

export function manpage(bot, message): void {
  console.log(message);
  bot.startPrivateConversation(message, (error, convo) => {
    if (!message.match) {
      message.match = [];
    }
    let section: string = message.match[1] || '1';
    switch (section.trim()) {
      case '1':
        convo.say(m1);
        break;

      case '2':
        convo.say(m2);
        break;
      
      default:
        convo.say(`\`\`\`Error: regex-bot has no section ${section.trim()}\`\`\``);
        break;
    }
    convo.next();
  });
}

Regex Bot
=========

Suck it, Tom.

This bot has nothing to do with regexes.

## Running
Add your API keys to the file `config/keys.json`, then run:
```
npm install
npm start
```

## API
Start a conversation by using a mention (ie: say "@regex-bot"). It will ACK you and you can send it
any of the following queries.
### `purpose`
Display the bot's purpose.
### `help`
Display help information.
### `version`
Display version information.
### `repo`
Display the bot's source repository.
### `srd [query]`
Lookup an entry in the Systems Reference Document (SRD).
### `ask [query]`
Ask a natural language query using the Wolfram|Alpha API.
### `roll [query]`
Roll dice using Roll20 syntax.

## License
Licensed under the terms of the MIT license. See the file `LICENSE` in this 
directory.

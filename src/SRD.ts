import * as https from 'https';
import * as querystring from 'querystring';

export function getSRDAttachment(query: string): Promise<any> {
  return new Promise((resolve, reject) => {
    lookupSRD(query, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(createAttachmentFromData(data));
      }
    });
  });
}

function getCompendiumUrl(query: string): string {
  return `https://roll20.net${getCompendiumPath(query)}`;
}

function getCompendiumJsonPath(query: string): string {
  return `${getCompendiumPath(query)}.json`;
}

function getCompendiumPath(query: string): string {
  return `/compendium/dnd5e/${querystring.escape(query)}`;
}

function createAttachmentFromData(data: any): any {
  let fields: any[] = [];
  Object.keys(data.data).forEach((key) => {
    fields.push({
      title: key,
      value: data.data[key],
      short: true,
    });
  });

  let result = {
    title: data.name,
    title_link: getCompendiumUrl(data.name),
    fallback: `Roll20 Compendium entry for ${data.name}`,
    fields: fields,
    text: data.content,
  };

  return result;
}

export function lookupSRD(query: string, callback: (error: Error | null, json: any) => void): void {
  let req = https.get({
    host: 'roll20.net',
    path: getCompendiumJsonPath(query),
  }, (response) => {
    if (response.statusCode !== 200) {
      callback(new Error(`${response.statusCode}: ${response.statusMessage}`), null);
    } else {
      response.setEncoding('utf8');
      let raw = '';
      response.on('data', (chunk) => {
        raw += chunk;
      });
      response.on('end', () => {
        let error = null;
        let result = null;
        try {
          result = JSON.parse(raw);
        } catch (e) {
          error = e;
        }
        callback(error, result);
      });
    }
  });
  req.on('error', (e) => {
    callback(e, null);
  });
  req.end();
}

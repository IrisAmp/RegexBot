import * as https from 'https';
import * as querystring from 'querystring';

import { IMessasgeAttachment } from './common';

export function getSRDAttachment(query: string): Promise<any> {
  return lookupSRD(query).then(createAttachmentFromData);
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

function createAttachmentFromData(data: any): IMessasgeAttachment {
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

export function lookupSRD(query: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let req = https.get({
      host: 'roll20.net',
      path: getCompendiumJsonPath(query),
    }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`${response.statusCode}: ${response.statusMessage}`));
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
            reject(e);
          }
          resolve(result);
        });
      }
    });
    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
}

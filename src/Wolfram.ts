import * as https from 'https';
import * as querystring from 'querystring';

import { IMessasgeAttachment, parseHttpResponse } from './common';

const KEYS = require('../config/keys.json');

export function getWolframAttachment(query: string): Promise<IMessasgeAttachment> {
  if (query.length > 1024) {
    return Promise.reject(new Error('413: Payload Too Large'));
  } else {
    return lookupWolfram(query).then((data) => {
      return convertResponseToAttachment(query, data);
    });
  }
}

function getQueryPath(query: string): string {
  query = query.replace(/\s+/g, ' ');
  query = querystring.escape(query);
  query = query.replace(/\%20/g, '+');
  return `/v2/result?i=${query}&appid=${KEYS.wolfram}`;
}

function getWolframLink(query: string): string {
  query = query.replace(/\s+/g, ' ');
  query = querystring.escape(query);
  query = query.replace(/\%20/g, '+');
  return `https://www.wolframalpha.com/input/?i=${query}`;
}

function lookupWolfram(query: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get({
      host: 'api.wolframalpha.com',
      path: getQueryPath(query),
    }, (response) => {
      parseHttpResponse(response, resolve, reject);
    });
  });
}

function convertResponseToAttachment(originalQuery: string, data: any): IMessasgeAttachment {
  return {
    fallback: data,
    title: originalQuery,
    title_link: getWolframLink(originalQuery),
    text: data,
  };
}

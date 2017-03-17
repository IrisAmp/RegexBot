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
    return Promise.reject(new Error('501: NOT IMPLEMENTED'));
  } else {
    return Promise.reject(new Error('HOST DOES NOT HAVE SUITABLE RNG'));
  }
}

interface Expression extends Array<Expression | string> {

}

export function parseExpression(query: string): Expression {
  let result: Expression = [];

  let firstOpenParen = query.indexOf('(');
  let firstCloseParen = query.indexOf('(');

  if (firstOpenParen < 0 && firstCloseParen < 0) {
    // There are no paren
    return [query];
  } else if (firstOpenParen < 0 || firstCloseParen < 0 || firstCloseParen < firstOpenParen) {
    // The paren are unmatched.
    throw new Error(`UNMATCHED PARENTHESIS`);
  }

  // Add the content before the paren
  if (firstOpenParen > 0) {
    result.push(query.slice(0, firstOpenParen));
  }

  // Find the paren that matches the first open paren.
  let parenStack: number[] = [firstOpenParen];
  let matchingParen = firstOpenParen;
  while (parenStack.length > 0 && matchingParen < query.length) {
    ++matchingParen;
    if (query.charAt(matchingParen) === '(') {
      parenStack.push(matchingParen);
    } else if (query.charAt(matchingParen) === ')') {
      parenStack.pop();
    }
  }

  if (parenStack.length > 0) {
    throw new Error(`UNMATCHED PARENTHESIS`);
  }

  // Recurse into the matched parens.
  result.push(parseExpression(query.slice(firstOpenParen + 1, matchingParen)));

  // Process the remaining part of the query
  if (matchingParen < query.length - 1) {
    result.push(...parseExpression(query.slice(matchingParen + 1)));
  }

  return result;
}

function translateExpression() {
  
}

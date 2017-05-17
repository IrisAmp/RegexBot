import { IncomingMessage } from 'http';

export interface IMessasgeAttachment {
  fallback: string;
  color?: string;
  pretext?: string;
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  mrkdwn_in?: Array<string>;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: {
    title: string;
    value: string;
    short: boolean;
  }[];
  image_url?: string;
  thumb_url?: string;
  footer?: string;
  footer_icon?: string;
}

export function parseHttpResponse(
  response: IncomingMessage,
  resolve: (value?: string) => void,
  reject: (reason?: any) => void
): void {
  if (response.statusCode !== 200) {
    reject(new Error(`${response.statusCode}: ${response.statusMessage}`));
  } else {
    response.setEncoding('utf8');
    let raw = '';
    response.on('data', (chunk) => {
      raw += chunk;
    });
    response.on('end', () => {
      resolve(raw);
    });
    response.on('error', (error) => {
      reject(error);
    });
  }
}

export function formatBotResponse(msg: string): string {
  return `\`${msg}\``;
}

import { config, Env } from './config';

export function init(key: string, env?: Env) {
  config.authKey = key;
  config.env = env || 'dev';
}

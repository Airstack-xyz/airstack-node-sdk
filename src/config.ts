export type Env = 'dev' | 'prod';

export type ConfigType = {
  authKey: string;
  env?: Env;
  cache?: boolean;
};

export const config: ConfigType = {
  authKey: '',
  env: 'dev',
  cache: true,
};

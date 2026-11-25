import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'dist-server/**/*', 'node_modules/**/*', 'src/**/*', 'server.ts', 'vite.config.ts'],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];

export const environment = {
  appVersion: require('../../package.json').version,
  production: true,
  prod:"node --stack_size=4048 node_modules/.bin/ng build --prod",
  appURL: "https://localhost:44393",
  inventHelpURL: "https://localhost:44349"
};

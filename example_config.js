if(process.env.NODE_ENV !== 'production') {
  // i.e. you are working from localhost
  module.exports.keys = {
    gitHubClientId: '2e0c23693ad4bdc28277',
    gitHubSecretKey: '1a83361531f95647d54183aba3601ff8ca1d51dd',
    gitCallbackUrl: 'http://localhost:3000/callback'
}
}
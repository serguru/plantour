export const environment = {
  environment: "qa",
  // Put QA API endpoints and feature flags here
  api: {
    baseUrl: 'https://qaapi.plantour.app'
  },
  clientUrl: 'https://qa.plantour.app',
  paymentProvider: 'stripe',
  googleClientId: '918703665460-7vpm4ecriksjt5lv6fqhkvvbmqi92h0l.apps.googleusercontent.com',
  facebookAppId: '2076632839798115',
  turnstileSiteKey: '0x4AAAAAACyoFgfZ0bvLNGPQ',
  version: '2.16.4',
  paddleKey: "",
  map: {
    apiKey: 'AIzaSyBhYxg_0ULXq6ypIGXrl8wGWc0VyO68pPI',
    mapId: 'DEMO_MAP_ID',
    language: 'en',
    region: 'CA',
    defaultCenter: {
      lat: 50,
      lng: -35,
    },
  }
};

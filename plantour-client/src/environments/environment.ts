import { LocalStorageService } from "../app/services/local-storage-service";

export const environment = {
  production: false,
  // Put development API endpoints and feature flags here
  apiUrl: 'http://192.168.4.32:5217',
  localStorageService: LocalStorageService
};

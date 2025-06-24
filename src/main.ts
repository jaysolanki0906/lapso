import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { AppInitService } from './app/core/services/app-init.service';

// This function tells Angular to run your init logic before the app bootstraps
export function initializeApp(appInitService: AppInitService) {
  return () => appInitService.initApp(); // should return a Promise or Observable
}

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppInitService],
      multi: true
    }
  ]
})
.catch((err) => console.error(err));

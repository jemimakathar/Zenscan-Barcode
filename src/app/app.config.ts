import { ApplicationConfig } from '@angular/core';
import { provideRouter, RouterModule, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { AuthenticationService } from './Services/authentication.service';
import { CouchdbService } from './Services/couchdb.service';




export const appConfig: ApplicationConfig = 
{
  providers: [provideRouter(routes, withComponentInputBinding()), provideClientHydration(), provideHttpClient(withFetch()), AuthenticationService,CouchdbService,HttpClientModule,RouterModule]
};

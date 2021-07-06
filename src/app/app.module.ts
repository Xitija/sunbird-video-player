import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SunbirdVideoPlayerModule} from '@project-sunbird/sunbird-video-player-v8';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SunbirdVideoPlayerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

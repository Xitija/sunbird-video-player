import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SunbirdPlayerSdkModule  } from '@project-sunbird/sunbird-player-sdk-v8';
import { SunbirdVideoPlayerComponent } from './sunbird-video-player.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [SunbirdVideoPlayerComponent, VideoPlayerComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    SunbirdPlayerSdkModule
  ],
  exports: [SunbirdVideoPlayerComponent , SunbirdPlayerSdkModule]
})
export class SunbirdVideoPlayerModule { }

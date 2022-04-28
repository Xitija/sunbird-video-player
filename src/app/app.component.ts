import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { samplePlayerConfig } from './data';

export interface EcarManifest {
  id: string;
  ver: string;
  ts: string;
  params: Object;
  archive: any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  contentId = 'do_2133803600096624641146'; //  do_21310353608830976014671
  videoMetaDataEvents: object;
  playerConfig;
  constructor(private apiService: ApiService) {
  }

  playerEvent(event) {
    // console.log(event);
    this.videoMetaDataEvents = event;
    // if (event.eid === 'END') {
    //   let videoMetaDataConfig = event.metaData;
    //   localStorage.setItem('config', JSON.stringify(videoMetaDataConfig));
    //   videoMetaDataConfig = JSON.parse(localStorage.getItem('config')) || {};
    //   const config = { ...samplePlayerConfig.config, ...videoMetaDataConfig };
    //   this.playerConfig.config = config;
    // }
  }

  telemetryEvent(event) {
    // console.log('in app: ', JSON.stringify(event));
  }

  ngOnInit(): void {
    if (this.apiService.isOffline) {
      this.contentId = 'do_11345176856416256012';
      this.apiService.videoContentId = this.contentId;
      // this.httpClient.get("assets/content/do_11345176856416256012/manifest.json")
      this.apiService.getLocalContent(this.contentId).subscribe((data: any) => {
        console.log("DATA", data);
        data.streamingUrl = null;
        data.isAvailableLocally = true;
        data.basePath = `assets/content/${this.contentId}`;
        console.log("data", data);
        this.initializePlayer(data);
      }, error => {
        alert("Content not available");
        console.log("error", error);
      });
    } else {
      this.apiService.getContent(this.contentId).subscribe(res => {
        this.initializePlayer(res);
      });
    }
  }

  initializePlayer(metadata) {

    let videoConfigMetadata: any = localStorage.getItem('config') || '{}';
    let config;
    if (videoConfigMetadata) {
      videoConfigMetadata = JSON.parse(videoConfigMetadata);
      config = { ...samplePlayerConfig.config, ...videoConfigMetadata }
    }
    this.playerConfig = {
      context: samplePlayerConfig.context,
      config: config ? config : samplePlayerConfig.config,
      metadata: metadata,
      data: {}
    }
  }
}

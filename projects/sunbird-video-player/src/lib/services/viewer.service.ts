import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { PlayerConfig } from '../playerInterfaces';
import { SunbirdVideoPlayerService } from '../sunbird-video-player.service';
import { UtilService } from './util.service';
import { errorCode , errorMessage } from '@project-sunbird/sunbird-player-sdk-v8';

@Injectable({
  providedIn: 'root'
})
export class ViewerService {

  public endPageSeen = false;
  public timeSpent = '0:0';
  private version = '1.0';
  public playerEvent = new EventEmitter<any>();
  public contentName: string;
  public showDownloadPopup: boolean;
  public streamingUrl: string;
  public mimeType: string;
  public artifactMimeType: string;
  public userName: string;
  public metaData: any;
  public PlayerLoadStartedAt: number;
  public totalLength;
  public currentlength;
  public totalSeekedLength;
  public artifactUrl;
  public visitedLength;
  public sidebarMenuEvent = new EventEmitter<any>();
  public traceId: string;
  public isAvailableLocally = false;

  constructor(private videoPlayerService: SunbirdVideoPlayerService,
    private utilService: UtilService,
    private http: HttpClient) {
    this.PlayerLoadStartedAt = new Date().getTime();
  }

  initialize({ context, config, metadata }: PlayerConfig) {
    this.contentName = metadata.name;
    this.isAvailableLocally = metadata.isAvailableLocally;
    this.streamingUrl = metadata.streamingUrl;
    this.artifactUrl = metadata.artifactUrl;
    this.mimeType = metadata.streamingUrl ? 'application/x-mpegURL' : metadata.mimeType;
    this.artifactMimeType = metadata.mimeType;
    this.isAvailableLocally = metadata.isAvailableLocally;
    this.traceId = config.traceId;
    if (context.userData) {
      const { userData: { firstName, lastName } } = context;
      this.userName = firstName === lastName ? firstName : `${firstName} ${lastName}`;
    }
    this.metaData = {
      actions: [
      ],
      volume: [],
      playBackSpeeds: [],
      totalDuration: 0
    };
    this.showDownloadPopup = false;
    this.endPageSeen = false;
    if(this.isAvailableLocally) {
      const basePath = (metadata.streamingUrl) ? (metadata.streamingUrl) : (metadata.basePath || metadata.baseDir)
      this.streamingUrl = `${basePath}/${metadata.artifactUrl}`;
      this.mimeType = metadata.mimeType;
    } 
  }

  async getPlayerOptions() {
    if (!this.streamingUrl) {
      return [{ src: this.artifactUrl, type: this.artifactMimeType }];
    } else {
      const data = await this.http.head(this.streamingUrl, { responseType: 'blob' }).toPromise().catch(error => {
        this.raiseExceptionLog(errorCode.streamingUrlSupport , errorMessage.streamingUrlSupport , new Error(`Streaming Url Not Supported  ${this.streamingUrl}`), this.traceId);
      });
      if (data) {
        return [{ src: this.streamingUrl, type: this.mimeType }];
      } else {
        return [{ src: this.artifactUrl, type: this.artifactMimeType }];
      }
    }
  }


  public pageSessionUpdate() {

  }

  raiseStartEvent(event) {
    const duration = new Date().getTime() - this.PlayerLoadStartedAt;
    const startEvent = {
      eid: 'START',
      ver: this.version,
      edata: {
        type: 'START',
        mode: 'play',
        duration
      },
      metaData: this.metaData
    };
    this.playerEvent.emit(startEvent);
    this.videoPlayerService.start(duration);
    this.PlayerLoadStartedAt = new Date().getTime();
  }

  raiseEndEvent() {
    const duration = new Date().getTime() - this.PlayerLoadStartedAt;
    const endEvent = {
      eid: 'END',
      ver: this.version,
      edata: {
        type: 'END',
        currentTime: this.currentlength,
        totalTime: this.totalLength,
        duration
      },
      metaData: this.metaData
    };
    this.playerEvent.emit(endEvent);
    this.timeSpent = this.utilService.getTimeSpentText(this.visitedLength);
    this.videoPlayerService.end(duration, this.totalLength, this.currentlength, this.endPageSeen, this.totalSeekedLength,
      this.visitedLength / 1000);
  }


  raiseHeartBeatEvent(type: string) {
    const hearBeatEvent = {
      eid: 'HEARTBEAT',
      ver: this.version,
      edata: {
        type,
        currentPage: 'videostage'
      },
      metaData: this.metaData
    };
    this.playerEvent.emit(hearBeatEvent);
    this.videoPlayerService.heartBeat(hearBeatEvent);
    const interactItems = ['PLAY', 'PAUSE', 'EXIT', 'VOLUME_CHANGE', 'DRAG',
      'RATE_CHANGE', 'CLOSE_DOWNLOAD', 'DOWNLOAD', 'NAVIGATE_TO_PAGE',
      'NEXT', 'OPEN_MENU', 'PREVIOUS', 'CLOSE_MENU', 'DOWNLOAD_MENU',
      'SHARE', 'REPLAY', 'FORWARD', 'BACKWARD', 'FULLSCREEN' , 'NEXT_CONTENT_PLAY'
    ];
    if (interactItems.includes(type)) {
      this.videoPlayerService.interact(type.toLowerCase(), 'videostage');
    }

  }

  raiseExceptionLog(errorCode: string, errorType: string, stacktrace, traceId) {
    const exceptionLogEvent = {
      eid: 'ERROR',
      edata: {
        err: errorCode,
        errtype: errorType,
        requestid: traceId || '',
        stacktrace: (stacktrace && stacktrace.toString()) || '',
      }
    };
    this.playerEvent.emit(exceptionLogEvent);
    this.videoPlayerService.error(errorCode , errorType , stacktrace);
  }

}

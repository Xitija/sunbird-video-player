import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { PlayerConfig, Transcripts } from '../playerInterfaces';
import { SunbirdVideoPlayerService } from '../sunbird-video-player.service';
import { UtilService } from './util.service';
import { errorCode , errorMessage } from '@project-sunbird/sunbird-player-sdk-v9';
import { QuestionCursor } from '@project-sunbird/sunbird-quml-player-v9';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash-es';

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
  public interceptionPoints: any;
  public interceptionResponses: any = {};
  public showScore = false;
  public scoreObtained: any = 0;
  public maxScore: number;
  public playerInstance: any;
  public contentMap = {};
  public isEndEventRaised = false;
  public transcripts: Transcripts;
  constructor(private videoPlayerService: SunbirdVideoPlayerService,
              private utilService: UtilService,
              private http: HttpClient,
              public questionCursor: QuestionCursor) {
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
    this.interceptionPoints = metadata.interceptionPoints;
    if (context.userData) {
      const { userData: { firstName, lastName } } = context;
      this.userName = firstName === lastName ? firstName : `${firstName} ${lastName}`;
    }
    this.metaData = {
      actions: [
      ],
      volume: [],
      playBackSpeeds: [],
      totalDuration: 0,
      muted: undefined,
      currentDuration: undefined,
      transcripts: []
    };
    this.transcripts = metadata.transcripts ? metadata.transcripts : [];
    this.showDownloadPopup = false;
    this.endPageSeen = false;
    if (this.isAvailableLocally) {
      const basePath = (metadata.streamingUrl) ? (metadata.streamingUrl) : (metadata.basePath || metadata.baseDir);
      this.streamingUrl = `${basePath}/${metadata.artifactUrl}`;
      this.mimeType = metadata.mimeType;
    }
  }
  handleTranscriptsData(selectedTranscripts) {
    this.metaData.transcripts = selectedTranscripts;
    if (!_.isArray(this.transcripts)) {
      this.raiseExceptionLog('INVALID_TRANSCRIPT_DATATYPE', 'TRANSCRIPT', new Error('Transcript data should be array'), this.traceId);
      return [];
    } else {
           _.forEach(this.transcripts, (value) => {
        if (!(_.some(this.transcripts, { language: value.language, artifactUrl: value.artifactUrl ,
          languageCode: value.languageCode, identifier: value.identifier}))) {
          this.raiseExceptionLog('TRANSCRIPT_DATA_MISSING', 'TRANSCRIPT',
           new Error('Transcript object dose not have required fields'), this.traceId);
          return [];
        } else if (!_.isEmpty(selectedTranscripts) &&
          ( _.last(selectedTranscripts) !== 'off' &&  _.last(selectedTranscripts) === value.languageCode)) {
          value.default = true;
        }
      });
    }
    return this.transcripts;
  }
  async getPlayerOptions() {
    if (!this.streamingUrl) {
      return [{ src: this.artifactUrl, type: this.artifactMimeType }];
    } else {
      const data = await this.http.head(this.streamingUrl, { responseType: 'blob' }).toPromise().catch(error => {
        // tslint:disable-next-line:max-line-length
        this.raiseExceptionLog(errorCode.streamingUrlSupport , errorMessage.streamingUrlSupport , new Error(`Streaming Url Not Supported  ${this.streamingUrl}`), this.traceId);
      });
      if (data) {
        return [{ src: this.streamingUrl, type: this.mimeType }];
      } else {
        return [{ src: this.artifactUrl, type: this.artifactMimeType }];
      }
    }
  }

  getMarkers()  {
    if (this.interceptionPoints) {
      try {
        const interceptionPoints = this.interceptionPoints;
        this.showScore = true;
        return interceptionPoints.items.map(({interceptionPoint, identifier, duration}) => {
          return { time: interceptionPoint, text: '', identifier, duration: 3 };
        });
      } catch (error) {
        console.log(error);
        this.raiseExceptionLog('CPV2_CONT_INTERCEPTION_PARSE', 'error parsing the inteception points string', error, '');
        this.showScore = false;
      }
    }
    return null;
  }


  getQuestionSet(identifier) {
    const content = this.contentMap[identifier];
    if (!content) {
     return this.questionCursor.getQuestionSet(identifier)
     .pipe(map((response) => {
        this.contentMap[identifier] = response.questionSet;
        return this.contentMap[identifier];
       }));
    } else {
      return of(content);
    }
  }

  preFetchContent() {
    const nextMarker = this.getNextMarker();
    if (nextMarker) {
      const identifier = nextMarker.identifier;
      this.getQuestionSet(nextMarker.identifier);
    }
  }

  getNextMarker() {
    const currentTime = this.playerInstance.currentTime();
    const markersList = this.getMarkers();
    if (!markersList) { return null; }

    return markersList.find(marker => {
      const markerTime = marker.time;
      return markerTime > currentTime;
    });
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

  calculateScore() {
    this.scoreObtained =  Object.values(this.interceptionResponses).reduce(
      // tslint:disable-next-line:no-string-literal
      (acc, response) => acc + response['score'] , 0);
  }

  raiseEndEvent() {
    if (!this.isEndEventRaised) {
      this.calculateScore();
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
      this.videoPlayerService.end(
        duration,
        this.totalLength,
        this.currentlength,
        this.endPageSeen,
        this.totalSeekedLength,
        this.visitedLength / 1000,
        this.scoreObtained
      );
      this.isEndEventRaised = true;
    }
  }


  raiseHeartBeatEvent(type: string, extraValues?) {
    if (type === 'REPLAY') {
      this.interceptionResponses = {};
      this.showScore = false;
      this.scoreObtained = 0;
    }
    const hearBeatEvent = {
      eid: 'HEARTBEAT',
      ver: this.version,
      edata: {
        type,
        currentPage: 'videostage',
        extra: extraValues
      },
      metaData: this.metaData
    };
    this.playerEvent.emit(hearBeatEvent);
    this.videoPlayerService.heartBeat(hearBeatEvent);
    const interactItems = ['PLAY', 'PAUSE', 'EXIT', 'VOLUME_CHANGE', 'DRAG',
      'RATE_CHANGE', 'CLOSE_DOWNLOAD', 'DOWNLOAD', 'NAVIGATE_TO_PAGE',
      'NEXT', 'OPEN_MENU', 'PREVIOUS', 'CLOSE_MENU', 'DOWNLOAD_MENU', 'DOWNLOAD_POPUP_CLOSE', 'DOWNLOAD_POPUP_CANCEL',
      'SHARE', 'REPLAY', 'FORWARD', 'BACKWARD', 'FULLSCREEN', 'NEXT_CONTENT_PLAY', 'TRANSCRIPT_LANGUAGE_OFF',
      'TRANSCRIPT_LANGUAGE_SELECTED', 'VIDEO_MARKER_SELECTED'
    ];
    if (interactItems.includes(type)) {
      this.videoPlayerService.interact(type.toLowerCase(), 'videostage', extraValues);
    }
  }

  raiseImpressionEvent(pageId: string, cdata: any = {}) {
    this.videoPlayerService.impression(pageId, cdata);
  }

  // tslint:disable-next-line:no-shadowed-variable
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

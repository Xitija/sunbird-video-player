import { Injectable } from '@angular/core';
import { PlayerConfig } from './playerInterfaces';
import { UtilService } from './services/util.service';
import { CsTelemetryModule } from '@project-sunbird/client-services/telemetry';

@Injectable({
  providedIn: 'root'
})
export class SunbirdVideoPlayerService {

  private contentSessionId: string;
  private playSessionId: string;
  private telemetryObject: any;
  private context;
  public config;

  constructor(private utilService: UtilService) {
    this.contentSessionId = this.utilService.uniqueId();
  }

  public initialize({ context, config, metadata }: PlayerConfig) {
    this.context = context;
    this.config = config;
    this.playSessionId = this.utilService.uniqueId();

    if (!CsTelemetryModule.instance.isInitialised) {
      CsTelemetryModule.instance.init({});
      CsTelemetryModule.instance.telemetryService.initTelemetry(
        {
          config: {
            pdata: context.pdata,
            env: 'contentplayer',
            channel: context.channel,
            did: context.did,
            authtoken: context.authToken || '',
            uid: context.uid || '',
            sid: context.sid,
            batchsize: 20,
            mode: context.mode,
            host: context.host || '',
            endpoint: context.endpoint || '/data/v3/telemetry',
            tags: context.tags,
            cdata: (context.cdata || []).concat([{ id: this.contentSessionId, type: 'ContentSession' },
            { id: this.playSessionId, type: 'PlaySession' },
            { id: "2.0", type: "PlayerVersion" }])
          },
          userOrgDetails: {}
        }
      );
    }

    this.telemetryObject = {
      id: metadata.identifier,
      type: 'Content',
      ver: metadata.pkgVersion + '',
      rollup: context.objectRollup || {}
    };
  }


  public start(duration) {
    CsTelemetryModule.instance.telemetryService.raiseStartTelemetry(
      {
        options: this.getEventOptions(),
        edata: { type: 'content', mode: 'play', pageid: '', duration: Number((duration / 1e3).toFixed(2)) }
      }
    );

  }

  public end(duration, totallength, currentlength, endpageseen, totalseekedlength, visitedlength) {
    const durationSec = Number((duration / 1e3).toFixed(2));
    CsTelemetryModule.instance.telemetryService.raiseEndTelemetry({
      edata: {
        type: 'content',
        mode: 'play',
        pageid: 'sunbird-player-Endpage',
        summary: [
          {
            progress: Number(((currentlength / totallength) * 100).toFixed(0))
          },
          {
            totallength
          },
          {
            visitedlength
          },
          {
            visitedcontentend: (totallength === currentlength)
          },
          {
            totalseekedlength
          },
          {
            endpageseen
          }
        ],
        duration: durationSec
      },
      options: this.getEventOptions()
    });

  }

  public interact(id, currentPage) {
    CsTelemetryModule.instance.telemetryService.raiseInteractTelemetry({
      options: this.getEventOptions(),
      edata: { type: 'TOUCH', subtype: '', id, pageid: currentPage + '' }
    });
  }

  public heartBeat(data) {
    CsTelemetryModule.instance.playerTelemetryService.onHeartBeatEvent(data, {});
  }

  public impression(currentPage) {
    CsTelemetryModule.instance.telemetryService.raiseImpressionTelemetry({
      options: this.getEventOptions(),
      edata: { type: 'workflow', subtype: '', pageid: currentPage + '', uri: '' }
    });
  }

  public error(errorCode: string , errorType:string ,  stacktrace?:Error) {
    CsTelemetryModule.instance.telemetryService.raiseErrorTelemetry({
      options: this.getEventOptions(),
      edata: {
        err: errorCode,
        errtype: errorType,
        stacktrace: (stacktrace && stacktrace.toString()) || ''
      }
    });
  }

  private getEventOptions() {
    return ({
      object: this.telemetryObject,
      context: {
        channel: this.context.channel,
        pdata: this.context.pdata,
        env: 'contentplayer',
        sid: this.context.sid,
        uid: this.context.uid,
        cdata: (this.context.cdata || []).concat([{ id: this.contentSessionId, type: 'ContentSession' },
        { id: this.playSessionId, type: 'PlaySession' },
        {id: "2.0" , type: "PlayerVersion"}]),
        rollup: this.context.contextRollup || {}
      }
    });
  }
}

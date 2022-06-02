import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { VideoPlayerComponent } from './video-player.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ViewerService } from '../../services/viewer.service';
import { SunbirdVideoPlayerService } from '../../sunbird-video-player.service';
import { QuestionCursor } from '@project-sunbird/sunbird-quml-player-v9';
import { QuestionCursorImplementationService } from 'src/app/question-cursor-implementation.service';
import {mockData} from './video-player.component.data';
describe('VideoPlayerComponent', () => {
  let component: VideoPlayerComponent;
  let fixture: ComponentFixture<VideoPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [VideoPlayerComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [ViewerService, SunbirdVideoPlayerService,
        { provide: QuestionCursor, useClass: QuestionCursorImplementationService }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoPlayerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call pause()', () => {
    spyOn(component, 'toggleForwardRewindButton').and.callFake(() => 'true');
    spyOn(component.viewerService, 'raiseHeartBeatEvent').and.callFake(() => 'true');
    component.player = {
      pause: jasmine.createSpy('pause')
    };
    component.pause();
    expect(component.showPauseButton).toBeFalsy();
    expect(component.showPlayButton).toBeTruthy();
    expect(component.currentPlayerState).toEqual('pause');
    expect(component.toggleForwardRewindButton).toHaveBeenCalled();
    expect(component.viewerService.raiseHeartBeatEvent).toHaveBeenCalledWith('PAUSE');
    expect(component.player.pause).toHaveBeenCalled();
  });
  it('should call play()', () => {
    spyOn(component, 'toggleForwardRewindButton').and.callFake(() => 'true');
    component.player = {
      play: jasmine.createSpy('play')
    };
    component.play();
    expect(component.showPauseButton).toBeTruthy();
    expect(component.showPlayButton).toBeFalsy();
    expect(component.currentPlayerState).toEqual('play');
    expect(component.toggleForwardRewindButton).toHaveBeenCalled();
    expect(component.player.play).toHaveBeenCalled();
  });
  it('should call backward()', () => {
    spyOn(component, 'toggleForwardRewindButton').and.callFake(() => 'true');
    spyOn(component.viewerService, 'raiseHeartBeatEvent').and.callFake(() => 'true');
    component.backward();
    expect(component.toggleForwardRewindButton).toHaveBeenCalled();
    expect(component.viewerService.raiseHeartBeatEvent).toHaveBeenCalledWith('BACKWARD');
  });
  it('should call backward()', () => {
    spyOn(component, 'toggleForwardRewindButton').and.callFake(() => 'true');
    spyOn(component.viewerService, 'raiseHeartBeatEvent').and.callFake(() => 'true');
    component.forward();
    expect(component.toggleForwardRewindButton).toHaveBeenCalled();
    expect(component.viewerService.raiseHeartBeatEvent).toHaveBeenCalledWith('FORWARD');
  });
  it('should call handleVideoControls', () => {
    component.player = {
      currentTime: jasmine.createSpy('currentTime')
    };
    spyOn(component, 'updatePlayerEventsMetadata').and.callFake(() => 'true');
    component.totalSpentTime = 0;
    component.startTime = 0;
    component.handleVideoControls({ type: 'ended' });
    expect(component.totalSpentTime).toString();
    expect(component.viewerService.visitedLength).toEqual(component.totalSpentTime);
  });
  it('should call handleVideoControls for playing and setPreMetaDataConfig', () => {
    component.setMetaDataConfig = true;
    spyOn(component, 'setPreMetaDataConfig').and.callThrough();
    component.handleVideoControls({ type: 'playing' });
    expect(component.showPlayButton).toBeFalsy();
    expect(component.showPauseButton).toBeTruthy();
    expect(component.setMetaDataConfig).toBeFalsy();
    expect(component.setPreMetaDataConfig).toHaveBeenCalled();
  });
  it('should call handleVideoControls for playing and setPreMetaDataConfig is false', () => {
    component.setMetaDataConfig = false;
    spyOn(component, 'setPreMetaDataConfig').and.callThrough();
    component.handleVideoControls({ type: 'playing' });
    expect(component.showPlayButton).toBeFalsy();
    expect(component.showPauseButton).toBeTruthy();
    expect(component.setMetaDataConfig).not.toBeTruthy();
    expect(component.setPreMetaDataConfig).not.toHaveBeenCalled();
  });
  it('should call handleVideoControls for play ', () => {
    spyOn(component, 'updatePlayerEventsMetadata').and.callFake(() => 'true');
    component.handleVideoControls({ type: 'play' });
    expect(component.startTime).toBeDefined();
    expect(component.updatePlayerEventsMetadata).toHaveBeenCalledWith({ type: 'play' });
  });
  it('should call handleVideoControls for play ', () => {
    component.handleVideoControls({ type: 'loadstart' });
    expect(component.startTime).toBeDefined();
    expect(component.setMetaDataConfig).toBeTruthy();
  });
  it('should call handleVideoControls for timeupdate', () => {
    component.currentTime = 16990999900;
    component.player = {
      currentTime: jasmine.createSpy('currentTime')
    };
    spyOn(component, 'toggleForwardRewindButton').and.callThrough();
    component.handleVideoControls({ type: 'timeupdate' });
    expect(component.previousTime).toEqual(16990999900);
    expect(component.toggleForwardRewindButton).toHaveBeenCalled();
    expect(component.player.currentTime).toHaveBeenCalled();
  });
  it('should call handleVideoControls for seeking ', () => {
    component.previousTime = 16990999900;
    component.seekStart = null;
    component.handleVideoControls({ type: 'seeking' });
    expect(component.seekStart).toEqual(component.previousTime);
  });
  it('should call handleVideoControls for seeked for currentTime > seekStart', () => {
    component.player = {
      markers: jasmine.createSpy('markers')
    };
    component.currentTime = 1000;
    component.seekStart = 900;
    spyOn(component, 'updatePlayerEventsMetadata').and.callFake(() => 'true');
    component.handleVideoControls({ type: 'seeked' });
    expect(component.updatePlayerEventsMetadata).toHaveBeenCalledWith({ type: 'seeked' });
    expect(component.totalSeekedLength).toBeDefined();
    expect(component.viewerService.totalSeekedLength).toEqual(component.totalSeekedLength);
  });
  it('should call handleVideoControls for seeked  for currentTime < seekStart', () => {
    component.player = {
      markers: jasmine.createSpy('markers')
    };
    component.currentTime = 100;
    component.seekStart = 900;
    spyOn(component, 'updatePlayerEventsMetadata').and.callFake(() => 'true');
    component.handleVideoControls({ type: 'seeked' });
    expect(component.updatePlayerEventsMetadata).toHaveBeenCalledWith({ type: 'seeked' });
    expect(component.totalSeekedLength).toBeDefined();
    expect(component.viewerService.totalSeekedLength).toEqual(component.totalSeekedLength);
  });
  it('should call handleVideoControls for seeking ', () => {
    component.viewerService.metaData = { actions: [] };
    component.player = {
      currentTime: jasmine.createSpy('currentTime')
    };
    component.updatePlayerEventsMetadata({ type: 'seeking' });
    expect(component.viewerService.metaData.actions).toBeDefined();
  });
  it('should call setPreMetaDataConfig for player.volume', () => {
    component.config = { volume: { name: 'qwe' } };
    component.player = {
      volume: jasmine.createSpy('volume')
    };
    component.setPreMetaDataConfig();
    expect(component.player.volume).toHaveBeenCalled();
  });
  it('should call setPreMetaDataConfig for player.currentTime', () => {
    component.config = { currentDuration: 600000 };
    component.player = {
      currentTime: jasmine.createSpy('currentTime')
    };
    component.setPreMetaDataConfig();
    expect(component.player.currentTime).toHaveBeenCalled();
  });
  it('should call onLoadMetadata ', () => {
    component.viewerService.metaData = { totalDuration: 10000 };
    component.player = {
      duration: jasmine.createSpy('duration').and.returnValue(1000)
    };
    component.onLoadMetadata('e');
    expect(component.totalDuration).toBeDefined();
    expect(component.viewerService.metaData.totalDuration).toBeDefined();
  });
  it('should call registerEvents ', () => {
    component.player = {
      play: jasmine.createSpy('play'),
      on: jasmine.createSpy('on')
    };
    spyOn(component.viewerService, 'raiseHeartBeatEvent').and.callFake(() => 'true');
    spyOn(component, 'trackTranscriptEvent').and.callFake(() => 'true');
    component.registerEvents();
    expect(component.isAutoplayPrevented).toBeFalsy();
    expect(component.player.play).toHaveBeenCalled();
  });
  it('should call toggleForwardRewindButton and totalDuration > currentTime', () => {
    component.time = 0;
    component.totalDuration = 600000;
    component.player = {
      currentTime: jasmine.createSpy('currentTime').and.returnValue(60000),
    };
    component.toggleForwardRewindButton();
    expect(component.showForwardButton).toBeTruthy();
    expect(component.showBackwardButton).toBeTruthy();
  });
  it('should call toggleForwardRewindButton and totalDuration < currentTime', () => {
    component.time = 0;
    component.totalDuration = 10000;
    component.player = {
      currentTime: jasmine.createSpy('currentTime').and.returnValue(60000),
    };
    component.toggleForwardRewindButton();
    expect(component.showForwardButton).toBeFalsy();
    expect(component.showBackwardButton).toBeTruthy();
  });
  it('should call toggleForwardRewindButton and totalDuration < currentTime for showBackwardButton', () => {
    component.time = 20000;
    component.totalDuration = 30000;
    component.player = {
      currentTime: jasmine.createSpy('currentTime').and.returnValue(10000),
    };
    component.toggleForwardRewindButton();
    expect(component.showForwardButton).toBeTruthy();
    expect(component.showBackwardButton).toBeFalsy();
  });
  it('should call handleEventsForTranscripts for transcript language off', () => {
   const telemetryObject = {
      type: 'TRANSCRIPT_LANGUAGE_OFF',
      extra: {
        videoTimeStamp: 1.20
      }
    };
   component.viewerService.metaData = { transcripts: ['en'] };
   component.player = {
      currentTime: jasmine.createSpy('currentTime').and.returnValue(1.20),
    };
   spyOn(component.viewerService, 'raiseHeartBeatEvent').and.callFake(() => 'true');
   component.handleEventsForTranscripts({});
   expect(component.player.currentTime).toHaveBeenCalled();
   expect(component.viewerService.metaData.transcripts).toEqual(['en', 'off']);
   expect(component.viewerService.raiseHeartBeatEvent).toHaveBeenCalledWith(telemetryObject.type, telemetryObject.extra);
  });
  it('should call handleEventsForTranscripts for transcript language selected', () => {
    component.transcripts = mockData.transcripts;
    const telemetryObject = {
       type: 'TRANSCRIPT_LANGUAGE_SELECTED',
       extra: {
         videoTimeStamp: 2.230,
         transcript: {
          language: 'Bengali'
        },
       }
     };
    component.viewerService.metaData = { transcripts: ['en'] };
    component.player = {
       currentTime: jasmine.createSpy('currentTime').and.returnValue(2.230),
     };
    const track =  { artifactUrl: 'https://cdn.jsdelivr.net/gh/tombyrer/videojs-transcript-click@1.0/demo/captions.sv.vtt',
      languageCode: 'bn' };
    spyOn(component.viewerService, 'raiseHeartBeatEvent').and.callFake(() => 'true');
    component.handleEventsForTranscripts(track);
    expect(component.player.currentTime).toHaveBeenCalled();
    expect(component.viewerService.metaData.transcripts).toEqual(['en', 'bn']);
    expect(component.viewerService.raiseHeartBeatEvent).toHaveBeenCalledWith(telemetryObject.type, telemetryObject.extra);
   });
});

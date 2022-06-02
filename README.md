# Video player library for Sunbird platform!
Contains Video player library components powered by angular. These components are designed to be used in sunbird consumption platforms *(mobile app, web portal, offline desktop app)* to drive reusability, maintainability hence reducing the redundant development effort significantly.

# Getting Started
For help getting started with a new Angular app, check out the Angular CLI.
For existing apps, follow these steps to begin using .

## Step 1: Install the packages

    npm install @project-sunbird/sunbird-video-player-v9 --save
    npm install @project-sunbird/sunbird-quml-player-v9 --save
    npm install @project-sunbird/sb-styles --save
    npm install @project-sunbird/client-services --save
    npm install lodash-es --save
    npm install ngx-bootstrap --save
    npm install jquery --save
    npm install video.js --save
    npm install videojs-contrib-quality-levels --save
    npm install videojs-http-source-selector --save

## Step 2: Include the styles, scripts and assets in angular.json
    "styles": [
    ...
    ...
    "src/styles.css",
    "./node_modules/@project-sunbird/sb-styles/assets/_styles.scss",
    "./node_modules/video.js/dist/video-js.min.css",
    "./node_modules/@project-sunbird/sunbird-video-player-v9/lib/assets/videojs.markers.min.css",
    "./node_modules/videojs-http-source-selector/dist/videojs-http-source-selector.css"
    ],
    "scripts": [
    ...
    ...
    "node_modules/jquery/dist/jquery.min.js",
    "node_modules/video.js/dist/video.js",
    "node_modules/@project-sunbird/sunbird-video-player-v9/lib/assets/videojs-markers.js",
    "node_modules/videojs-contrib-quality-levels/dist/videojs-contrib-quality-levels.min.js",
    "node_modules/videojs-http-source-selector/dist/videojs-http-source-selector.min.js"
    ]

  Add following under architect.build.assets

     {
	    ...
	    "build": {
	    
	    "builder": "@angular-devkit/build-angular:browser",
	    
	    "options": {
		    ...
		    ...
    
		    "assets": [
		    
			   ...
			   ...
			    
			    {
				    "glob": "**/*.*",
				    "input": "./node_modules/@project-sunbird/sunbird-video-player-v9/lib/assets/",
				    "output": "/assets/"
			    },
          {
                "glob": "**/*",
                "input": "node_modules/@project-sunbird/sunbird-quml-player-v9/lib/assets/",
                "output": "/assets/"
          }
		    
		    ],
    
	    "styles": [
	    
	    ...
	    
	    "./node_modules/@project-sunbird/sb-styles/assets/_styles.scss",
	    "./node_modules/video.js/dist/video-js.min.css",
        "./node_modules/@project-sunbird/sunbird-video-player-v9/lib/assets/videojs.markers.min.css",
        "./node_modules/videojs-http-source-selector/dist/videojs-http-source-selector.css"
	    ],
	    "scripts": [
         ...
         "node_modules/jquery/dist/jquery.min.js",
         "node_modules/video.js/dist/video.js",
         "node_modules/@project-sunbird/sunbird-video-player-v9/lib/assets/videojs-markers.js",
         "node_modules/videojs-contrib-quality-levels/dist/videojs-contrib-quality-levels.min.js",
         "node_modules/videojs-http-source-selector/dist/videojs-http-source-selector.min.js"
         ]
	    ...
	    ...
    
    },

  

## Step 3: Import the modules and components
Import the NgModule where you want to use. Also create a [question-cursor-implementation.service](src/app/question-cursor-implementation.service.ts)
       
    import { SunbirdVideoPlayerModule } from '@project-sunbird/sunbird-video-player-v9';
    import { QuestionCursor } from '@project-sunbird/sunbird-quml-player-v9';
    import { QuestionCursorImplementationService } from './question-cursor-implementation.service';

    
    @NgModule({
	    ...
	    
	    imports: [SunbirdVideoPlayerModule],
	    providers: [{ provide: QuestionCursor, useClass: QuestionCursorImplementationService }],
	    
	    ...
    })

  
    export class TestAppModule { }

## Step 4: Send input to render Video player

Use the mock config in your component to send input to Video player
Click to see the mock - [playerConfig](src/app/data.ts)

## Player config
```js
var playerConfig = {
  "context": {
    "mode": "play",  // To identify preview used by the user to play/edit/preview
    "authToken": "", // Auth key to make  api calls
    "sid": "7283cf2e-d215-9944-b0c5-269489c6fa56", // User sessionid on portal or mobile 
    "did": "3c0a3724311fe944dec5df559cc4e006", // Unique id to identify the device or browser 
    "uid": "anonymous", // Current logged in user id
    "channel": "505c7c48ac6dc1edc9b08f21db5a571d", // Unique id of the channel(Channel ID)
    "pdata": {
      "id": "sunbird.portal", // Producer ID. For ex: For sunbird it would be "portal" or "genie"
      "ver": "3.2.12", // Version of the App
      "pid": "sunbird-portal.contentplayer" // Optional. In case the component is distributed, then which instance of that component
    },
    "contextRollup": { // Defines the content roll up data
      "l1": "505c7c48ac6dc1edc9b08f21db5a571d"
    },
    "tags": [ // Defines the tags data
      ""
    ],
    "cdata": [], // Defines correlation data
    "timeDiff": 0,  // Defines the time difference
    "objectRollup": {}, // Defines the object roll up data
    "host": "", // Defines the from which domain content should be load
    "endpoint": "", // Defines the end point
    "userData": {  // Defines the user data firstname & lastname
      "firstName": "",
      "lastName": ""
    }
  },
  "config": { 
	"traceId": "afhjgh", // Defines trace id
    "sideMenu": { 
      "showShare": true,    // show/hide share button in side menu. default value is true
      "showDownload": true, // show/hide download button in side menu. default value is true
      "showReplay": true, // show/hide replay button in side menu. default value is true
      "showExit": true,   // show/hide exit button in side menu. default value is true
    }
  },
  "metadata": {}, // Content metadata json object (from API response take -> response.result.content)
} 

```
## Telemetry property description
|Property Name| Description| Default Value
|--|----------------------|--|
| `context` | It is an `object` it contains the `uid`,`did`,`sid`,`mode` etc., these will be logged inside the telemetry  | ```{}``` |
| `mode` | It is  `string` to identify preview used by the user to play/edit/preview | ```play```|
| `authToken` | It is  `string` and Auth key to make  api calls | ```''```|
| `sid` | It is  `string` and User sessionid on portal or mobile | ```''```|
| `did` | It is  `string` and Unique id to identify the device or browser| ```''```|
| `uid` | It is  `string` and Current logged in user id| ```''```|
| `channel` | It is `string` which defines channel identifier to know which channel is currently using.| `in.sunbird` |
| `pdata` | It is an `object` which defines the producer information it should have identifier and version and canvas will log in the telemetry| ```{'id':'in.sunbird', 'ver':'1.0'}```|
| `contextRollup` | It is an `object` which defines content roll up data | ```{}```|
| `tags` | It is an `array` which defines the tag data | ```[]```|
| `objectRollup` | It is an `object` which defines object rollup data | ```{}```|
| `host` | It is  `string` which defines the from which domain content should be load|```window.location.origin```  |
| `userData` | It is an `object` which defines user data | ```{}```|
| `cdata` | It is an `array` which defines the correlation data | ```[]```|

## Config property description
|Property Name| Description| Default Value
|--|----------------------|--|
| `config` | It is an `object` it contains the `sideMenu`, these will be used to configure the canvas  | ```{ traceId: "12345", sideMenu: {"showShare": true, "showDownload": true, "showReplay": true, "showExit": true}}``` |
| `config.traceId` | It is  `string` which defines the trace id | ```''```|
| `config.sideMenu.showShare` | It is  `boolean` to show/hide share button in side menu| ```true```|
| `config.sideMenu.showDownload` | It is  `boolean` to show/hide download button in side menu| ```true```|
| `config.sideMenu.showReplay` | It is  `boolean` to show/hide replay button in side menu| ```true```|
| `config.sideMenu.showExit` | It is  `boolean` to show/hide exit button in side menu| ```true```|
| `metadata` | It is an `object` which defines content metadata json object (from API response take -> response.result.content) | ```{}```|

## Available components
|Feature| Notes| Selector|Code|Input|Output
|--|--|--|------------------------------------------------------------------------------------------|---|--|
| Video Player | Can be used to render videos | sunbird-video-player| *`<sunbird-video-player [playerConfig]="playerConfig"><sunbird-video-player>`*|playerConfig|playerEvent, telemetryEvent|

<br /><br />

# Mobile app integration steps 
For existing apps, follow these steps to begin using.

## Step 1: Install the packages

Click to see the steps - [InstallPackages](README.md#step-1-install-the-packages)

## Step 2: Include the sb-styles and assets in angular.json
Click to see the steps - [IncludeStyles](README.md#step-2-include-the-styles-scripts-and-assets-in-angularjson) , but use 
`src/global.scss` instead of  `src/styles.css` in styles.

## Step 3: Import the modules and components

Click to see the steps - [Import](README.md#step-3-import-the-modules-and-components)


## Step 4: Import in component       
     <sunbird-video-player [playerConfig]="playerConfig" (playerEvent)="playerEvents($event)"
      (telemetryEvent)="playerTelemetryEvents($event)"></sunbird-video-player> 

## Step 5: Send input to render VIDEO player

Click to see the input data - [playerConfig](README.md#step-4-send-input-to-render-video-player)


## Sample code
Click to see the sample code - [sampleCode](https://github.com/Sunbird-Ed/SunbirdEd-mobile-app/blob/release-4.8.0/src/app/player/player.page.html)
<br /><br />

# Use as web components	

Import this library in any web application and use the custom component.

Follow below-mentioned steps to use it in plain javascript project:

- Insert [library](https://github.com/project-sunbird/sunbird-video-player/blob/release-4.3.0/web-component/sunbird-video-player.js) as below:
	```javascript
	<script type="text/javascript" src="sunbird-video-player.js"></script>
	```
- Create a asset folder and copy all the files from [here](https://github.com/project-sunbird/sunbird-video-player/tree/release-4.3.0/web-component/assets), library requires these assets internally to work well.
- Get sample playerConfig from here: [playerConfig](https://github.com/project-sunbird/sunbird-video-player/blob/release-4.3.0/src/app/data.ts)

- Pass the QuestionListAPI baseUrl for eg. 
	```javascript
    window.questionListUrl = 'https://staging.sunbirded.org/api/question/v1/list';
    window.questionSetBaseUrl = 'https://staging.sunbirded.org/api/questionset';
    ```
  
- Create a custom html element: `sunbird-video-player`
	```javascript
    const  videoElement = document.createElement('sunbird-video-player');
   ```

- Pass data using `player-config`
	```javascript
	videoElement.setAttribute('player-config', JSON.stringify(playerConfig));
	```

	**Note:** Attribute should be in **string** type

- Listen for the output events: **playerEvent** and **telemetryEvent**

	```javascript
	videoElement.addEventListener('playerEvent', (event) => {
		console.log("On playerEvent", event);
	});
	videoElement.addEventListener('telemetryEvent', (event) => {
		console.log("On telemetryEvent", event);
	});
	```
- Append this element to existing element
	```javascript
	const  myPlayer = document.getElementById("my-player");
	myPlayer.appendChild(qumlPlayerElement);
	```
- Refer demo [example](https://github.com/project-sunbird/sunbird-video-player/blob/release-4.3.0/web-component/index.html)

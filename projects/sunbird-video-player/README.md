# Sunbird Video Player
Player for playing Video/Audio contents for sunbird applications

## Prerequisite

  Node JS version > 12

## Usage


`npm i @project-sunbird/sunbird-video-player-v8`


Add the module to the your player root module 

`import  { SunbirdVideoPlayerModule } from '@project-sunbird/sunbird-video-player-v8';`

```javascript
@NgModule({
  ...
  imports: [
    ...,
    SunbirdVideoPlayerModule
  ]
})
```

add the assets, scripts and styles in angular.json file

```javascript
....
 "assets": [
              "src/favicon.ico",
              "src/assets",
              {
                "glob": "**/*",
                "input": "node_modules/@project-sunbird/sunbird-video-player-v8/lib/assets/",
                "output": "/assets/"
              }
],
  "scripts": [
  ...
    "node_modules/@project-sunbird/telemetry-sdk/index.js"
    ....
  ],
  
"styles": [
...
"node_modules/@project-sunbird/sb-styles/assets/_styles.scss",
"node_modules/video.js/dist/video-js.min.css",
"src/styles.css"
....
],
...

```

add peer dependecies of the player as dependecies in your project
 

add the component selector in your component like below

```html

    <sunbird-video-player 
                [playerConfig]="playerConfig" 
                (playerEvent)="playerEvent($event)" 
                (telemetryEvent)="telemetryEvent($event)">
    </sunbird-video-player>

```

Still facing issues please refer the demo project in this repo as example

## Development

  check out this repo with latest release version branch

  cd to {repo_path} in terminal

  run  `sh setup.sh`

  above script installs the dependecies and link the epub player library project to demo app

  if you do any changes in library project run to get latest changes in demo app

  `npm run build-lib-link`

  once above command completed run `npm run start` which will run the player in demo app at http://localhost:4200



## References

https://docs.videojs.com/

# Lovelace Wallpanel Screensaver
Wall panel mode for your Home Assistant Lovelace dashboard with more focus on screensaver. Configurable extension which features a fullscreen kiosk mode, image and weather-clock screensaver, screen wake lock and the ability to hide side and top bar.

![Screenshot of screensaver](./doc/screenshot-default-config-screensaver.png)
![Screenshot of screensaver](./doc/screenshot-screensaver.gif)

## Installation and Upgrade
### HACS
1. Install [HACS](https://hacs.xyz).
2. Go to any of the sections (integrations, frontend, automation).
3. Click on the 3 dots in the top right corner.
4. Select "Custom repositories".
5. Copy and add the URL of this repository.
6. Select the correct category: frontend.
7. Click the "ADD" button.
8. Reload the webpage in your browser.

### Manual Installation
1. Download [wallpanel-screensaver.js](wallpanel-screensaver.js) and place it into the folder **config/www**.
2. Open Home Assistant Configuration => Lovelace Dashboards => Resources and add **/local/wallpanel-screensaver.js** (Resource type: **JavaScript module**).

### Manual Upgrade
1. Download latest [wallpanel-screensaver.js](wallpanel-screensaver.js) and place it into the folder **config/www**.
2. Open Home Assistant Configuration => Lovelace Dashboards => Resources and modify the resource URL to force browsers to reload the resource.
For example you could add or change the query string: **/local/wallpanel-screensaver.js?v2**

## Configuration
You can set the following configuration parameters for every individual lovelace dashboard:

| Config                  | Description                                                                               | Default |
| ----------------------- | ----------------------------------------------------------------------------------------- | ------- |
| enabled                 | Enable wallpanel-screensaver? <br>*You will need to set this to **true** to activate the wallpanel-screensaver for the dashboard.* | false   |
| debug                   | Show debug output.                                                                        | false   |
| hide_toolbar            | Hide the upper panel toolbar.                                                             | false   |
| hide_sidebar            | Hide the navigation sidebar.                                                              | false   |
| fullscreen              | Set browser window to fullscreen? <br>*Due to browser restrictions you will need to interact with the screen once to activate fullscreen mode after loading the dashboard page.* | false   |
| idle_time               | Time in seconds after which the screensaver will start (0 = screensaver disabled).        | 15      |
| fade_in_time            | Screensaver fade-in time in seconds.                                                      | 3.0     |
| crossfade_time          | Crossfade duration in seconds for screensaver images.                                     | 3.0     |
| display_time            | Duration in seconds after which the next screensaver image will be shown.                 | 15.0    |
| screensaver_tint        | Tint the screensaver on a scale of 0 (transparent) - 100 (Opaque). Useful for adjusting visibily of date-time and weather information views from a distance. | 25   |
| display_tint            | Tint the display on a scale of 0 (transparent) - 100 (Opaque) when screensaver is active. | 0       | 
| keep_screen_on_time     | Time in seconds for how long to prevent screen to dimm or lock (0 = disabled). <br>*Due to browser restrictions you will need to interact with the screen once to activate screen wake lock after loading the dashboard page.* | 0       |
| black_screen_after_time | Time in seconds after which the screensaver will show just a black screen (0 = disabled). | 0       |
| weather_entity          | Pass the weather entity if home name is not default (Home) in your Home Assistant setup. Pass empty string to disable weather info view.  | weather.home |
| image_url               | Fetch screensaver images from this URL. The following variables can be used: <ul><li>${timestamp} = current unix timestamp</li><li>${width} = viewport width</li><li>${height} = viewport height</li></ul>. Pass empty string to disable photo screensaver and instead have a black screen screensaver. | http://unsplash.it/${width}/${height}?random=${timestamp} |
| image_fit               | Value to be used for the CSS-property 'object-fit' of the images (possible values are: cover / contain / fill / ...). |     cover |
| info_update_interval    | Update interval for the screensaver weather-clock (date-time and weather information) (0 = disabled or hidden).            |  30     |
| info_position_update_interval | Time interval in seconds at which weather-clock (date-time and weather information) position will be randomly changed on the screensaver screen to avoid screen burn issue on always-on screens (0 = disabled). | 30     |
|	style                   | Additional CSS styles for wallpanel-screensaver elements.                                 | {}      |

### Lovelace dashboard yaml
You can add the configuration to your lovelace dashboard configuration yaml (at the top of raw config).

**Default Config:**:
```yaml
wallpanel_screensaver:
  enabled: false
  debug: false
  hide_toolbar: false
  hide_sidebar: false
  fullscreen: false
  idle_time: 15
  fade_in_time: 3.0
  crossfade_time: 3.0
  display_time: 15.0
  screensaver_tint: 25
  display_tint: 0
  keep_screen_on_time: 0
  black_screen_after_time: 0
  weather_entity: "weather.home"
  image_url: 'http://unsplash.it/${width}/${height}?random=${timestamp}'
  image_fit: cover
  info_update_interval: 30
  info_position_update_interval: 30
  style:
    wallpanel-screensaver-info-date:
      font-size: 8vh
      font-weight: 600
      color: '#ffffff'
      text-shadow: >-
        -2px -2px 0 #000000, 2px -2px 0 #000000, -2px 2px 0 #000000,
        2px 2px 0 #000000
    wallpanel-screensaver-info-time:
      font-size: 15vh
      font-weight: 1200
      color: '#ffffff'
      text-shadow: >-
        -2.5px -2.5px 0 #000000, 2.5px -2.5px 0 #000000, -2.5px 2.5px 0 #000000, 2.5px 2.5px 0
        #000000
    wallpanel-screensaver-info-weather:
      font-size: 5vh
      font-weight: 400
      color: '#ffffff'
      text-shadow: >-
        -1.5px -1.5px 0 #000000, 1.5px -1.5px 0 #000000, -1.5px 1.5px 0 #000000,
        1.5px 1.5px 0 #000000
```

### URL query parameters
It is also possible to pass configuration parameters in the query string.
These parameters (**wpss_\<parameter\>**) will override the corresponding properties in the yaml configuration.
This will allow you to use device specific settings.
Use JSON syntax for the values.

**Example**:
`http://hass:8123/lovelace/default_view?wpss_hide_sidebar=false&wpss_idle_time=60&wpss_style={"wallpanel-screensaver-info-date":{"font-size":"10vh"}}`

#### Activate on individual devices only
1. Set enabled to **false** in your dashboard configuration.
```yaml
wallpanel_screensaver:
  enabled: false
```
2. Add a query string to the URL to activate on a device:
`http://hass:8123/lovelace/default_view?wpss_enabled=true`

## Usage Examples
### 1. Default screensaver (with default config)
```yaml
wallpanel_screensaver:
  enabled: true
```
![Screenshot of screensaver](./doc/screenshot-default-config-screensaver.png)

### 2. Black weather-clock screensaver
```yaml
wallpanel_screensaver:
  enabled: true
  idle_time: 10
  weather_entity: "weather.mansion"
  image_url: ''
  info_update_interval: 30
```
![Screenshot of screensaver](./doc/screenshot-black-weather-clock-screensaver.png)

### 3. Photos only screensaver
```yaml
wallpanel_screensaver:
  enabled: true
  idle_time: 10
  info_update_interval: 0
  screensaver_tint: 0
```
![Screenshot of screensaver](./doc/screenshot-photos-only-screensaver.png)

### 4. Dim or tinted display screensaver
```yaml
wallpanel_screensaver:
  enabled: true
  idle_time: 10
  screensaver_tint: 25
  display_tint: 75
```
![Screenshot of screensaver](./doc/screenshot-tinted-display-screensaver.png)

# Credits
This project is forked from:
https://github.com/j-a-n/lovelace-wallpanel

Above project was inspired by:
- https://github.com/tcarlsen/lovelace-screensaver
- https://gist.github.com/ciotlosm/1f09b330aa5bd5ea87b59f33609cc931
- https://github.com/richtr/NoSleep.js
- https://github.com/madeInLagny/mil-no-sleep
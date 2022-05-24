/**
 * (C) 2022 by Shreyas R (nihal00690@gmail.com)
 * for the following changes made: 
 * - Re-organisation of the code for better readability.
 * - Bug fixes and optimisations.
 * - Added new features related to the screen saver.
 * 
 * For more details about the changes, checkout the public github releases at
 * https://github.com/Shreyas-R/lovelace-wallpanel-screensaver/releases
 * 
 * (C) 2020 by Jan Schneider (oss@janschneider.net)
 * Released under the GNU General Public License v3.0
 */


// ---------------------------------------- DEPENDENCIES [START] ---------------------------------------- //
class ScreenWakeLock {
	constructor() {
		this.enabled = false;
		this.error = null;
		this.debug = false;
		this._useNativeWakeLock = "wakeLock" in navigator;
		this._lock = null;
		this._player = null;
		this._isPlaying = false;

		const handleVisibilityChange = () => {
			if (this.debug) console.debug("handleVisibilityChange");
			if (this.enabled && !document.hidden) {
				this.enable();
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		document.addEventListener("fullscreenchange", handleVisibilityChange);

		if (!this._useNativeWakeLock) {
			let videoData = 'data:video/mp4;base64,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';
			this._player = document.createElement("video");
			this._player.setAttribute("id", "ScreenWakeLockVideo");
			this._player.setAttribute("src", videoData);
			this._player.setAttribute("playsinline", "");
			this._player.setAttribute("muted", "");
			this._player.addEventListener('ended', (event) => {
				if (this.debug) console.debug("Video ended");
				this.enable();
			});
			this._player.addEventListener('playing', (event) => {
				if (this.debug) console.debug("Video playing");
				this._isPlaying = true;
			});
			this._player.addEventListener('pause', (event) => {
				if (this.debug) console.debug("Video pause");
				this._isPlaying = false;
			});
		}
	}

	enable() {
		if (this._useNativeWakeLock) {
			if (this.debug) console.debug("Requesting native screen wakelock");
			//if (this._lock) {
			//	this._lock.release();
			//}
			navigator.wakeLock
				.request("screen")
				.then((wakeLock) => {
					if (this.debug) console.debug("Request screen wakelock successful");
					this._lock = wakeLock;
					this.enabled = true;
					this.error = null;
				})
				.catch((e) => {
					this.enabled = false;
					this.error = e;
					console.error(`Failed to request screen wakeLock: ${e}`);
				});
		}
		else {
			if (this.debug) console.debug("Starting video player");
			if (!this._player.paused && this._player._isPlaying) {
				this._player.pause();
			}
			let playPromise = this._player.play();
			if (playPromise) {
				playPromise
					.then((r) => {
						this.enabled = true;
						this.error = null;
						if (this.debug) console.debug("Video play successful");
					})
					.catch((e) => {
						this.enabled = false;
						this.error = e;
						console.error(`Failed to play video: ${e}`);
					});
			}
		}
	}

	disable() {
		if (this._useNativeWakeLock) {
			if (this.debug) console.debug("Releasing native screen wakelock");
			if (this._lock) {
				this._lock.release();
			}
			this._lock = null;
		}
		else {
			if (this.debug) console.debug("Stopping video player");
			if (!this._player.paused && this._player._isPlaying) {
				this._player.pause();
			}
		}
		this.enabled = false;
	}
}
// ---------------------------------------- DEPENDENCIES [END] ---------------------------------------- //

// ---------------------------------------- GLOBAL CONSTANTS AND VARIABLES [START] ---------------------------------------- //
const version = "1.1.1";
const filesParentPath = getScriptParentPath();
const defaultConfig = {
	enabled: false,
	debug: false,
	hide_toolbar: false,
	hide_sidebar: false,
	fullscreen: false,
	idle_time: 15,
	fade_in_time: 3.0,
	crossfade_time: 3.0,
	display_time: 15.0,
	screensaver_tint: 25,
	display_tint: 0,
	keep_screen_on_time: 0,
	black_screen_after_time: 0,
	hour_12: null,
	weather_entity: "weather.home",
	image_url: "http://unsplash.it/${width}/${height}?random=${timestamp}",
	image_fit: 'cover', // cover / contain / fill
	info_update_interval: 30,
	info_position_update_interval: 30,
	info_position_crossfade_time: 3.0,
	style: {},
	night_mode: {},
	night_mode_check_interval: 30,
	info_template: ``
};

let config = {};
let activePanel = null;
let messageBoxTimeout = null;
let fullscreen = false;
let idleSince = Date.now();
let screensaverRunningSince;
let lastImageUpdate;
let lastInfoUpdate;
let lastInfoPositionUpdate = Date.now();
let bodyOverflowOrig;
let screenWakeLock = new ScreenWakeLock();
let imageList = [];
let imageIndex = -1;
let isNightModeActive = false;
let lastNightModeCheck;

const elHass = document.querySelector("body > home-assistant");
const elHaMain = elHass.shadowRoot.querySelector("home-assistant-main");
// ---------------------------------------- GLOBAL CONSTANTS AND VARIABLES [END] ---------------------------------------- //

// ---------------------------------------- GLOBAL UI ELEMENTS [START] ---------------------------------------- //
const messageBox = document.createElement('div');
messageBox.id = 'wallpanel-message-box';
messageBox.style.position = 'fixed';
messageBox.style.pointerEvents = "none";
messageBox.style.top = 0;
messageBox.style.left = 0;
messageBox.style.width = '100%';
messageBox.style.height = '10%';
messageBox.style.zIndex = 1001;
messageBox.style.visibility = 'hidden';
//messageBox.style.margin = '5vh auto auto auto';
messageBox.style.padding = '5vh 0 0 0';
messageBox.style.fontSize = '5vh';
messageBox.style.textAlign = 'center';
messageBox.style.color = '#eeeeee';
messageBox.style.textShadow = '-1px -1px 0 #111111, 1px -1px 0 #111111, -1px 1px 0 #111111, 1px 1px 0 #111111';
messageBox.style.transition = 'visibility 200ms ease-in-out';
document.body.appendChild(messageBox);

const debugBox = document.createElement('div');
debugBox.id = 'wallpanel-debug-box';
debugBox.style.position = 'fixed';
debugBox.style.pointerEvents = "none";
debugBox.style.top = '60%';
debugBox.style.left = 0;
debugBox.style.width = '100%';
debugBox.style.height = '40%';
debugBox.style.background = '#00000099';
debugBox.style.zIndex = 1001;
debugBox.style.visibility = 'hidden';
debugBox.style.fontFamily = 'monospace';
debugBox.style.fontSize = '12px';
debugBox.style.wordWrap = 'break-word';
debugBox.style.overflowY = 'auto';
document.body.appendChild(debugBox);
// ---------------------------------------- GLOBAL UI ELEMENTS [END] ---------------------------------------- //

// ---------------------------------------- SCREENSAVER UI ELEMENTS [START] ---------------------------------------- //
const screensaverContainer = document.createElement('div');
screensaverContainer.id = 'wallpanel-screensaver-container';
screensaverContainer.style.position = 'fixed';
screensaverContainer.style.top = 0;
screensaverContainer.style.left = 0;
screensaverContainer.style.width = '100vw';
screensaverContainer.style.height = '100vh';
screensaverContainer.style.background = '#000000';
screensaverContainer.style.opacity = 0;
screensaverContainer.style.zIndex = 1000;
screensaverContainer.style.visibility = 'hidden';
document.body.appendChild(screensaverContainer);

const imageOne = document.createElement('img');
imageOne.id = 'wallpanel-screensaver-image-one';
imageOne.style.position = 'absolute';
imageOne.style.top = 0;
imageOne.style.left = 0;
imageOne.style.width = '100%';
imageOne.style.height = '100%';
imageOne.style.objectFit = 'contain';
imageOne.style.opacity = 0;
screensaverContainer.appendChild(imageOne);

const imageTwo = imageOne.cloneNode(true);
imageTwo.id = 'wallpanel-screensaver-image-two';
screensaverContainer.appendChild(imageTwo);

const infoContainer = document.createElement('div');
infoContainer.id = 'wallpanel-screensaver-info-container';
infoContainer.style.position = 'absolute';
infoContainer.style.top = 0;
infoContainer.style.left = 0;
infoContainer.style.width = '100%';
infoContainer.style.height = '100%';
infoContainer.style.transition = 'opacity 2000ms ease-in-out';
screensaverContainer.appendChild(infoContainer);

const displayTintContainer = document.createElement('div');
displayTintContainer.id = 'wallpanel-screensaver-display-tint-container';
displayTintContainer.style.position = 'absolute';
displayTintContainer.style.top = 0;
displayTintContainer.style.left = 0;
displayTintContainer.style.width = '100%';
displayTintContainer.style.height = '100%';
displayTintContainer.style.transition = 'opacity 2000ms ease-in-out';
displayTintContainer.style.zIndex = 1;
infoContainer.appendChild(displayTintContainer);

const infoBox = document.createElement('div');
infoBox.id = 'wallpanel-screensaver-info-box';
infoBox.style.margin = '5vh auto auto 5vh';
infoBox.style.padding = '0 0 0 0';
infoBox.style.width = '50%';
infoBox.style.height = '50%';
infoBox.style.fontSize = '8vh';
infoBox.style.fontWeight = '600';
infoBox.style.color = '#ffffff';
infoBox.style.textShadow = '-2px -2px 0 #000000, 2px -2px 0 #000000, -2px 2px 0 #000000, 2px 2px 0 #000000';
infoBox.style.zIndex = 0;
infoBox.style.opacity = 1;
infoContainer.appendChild(infoBox);
// ---------------------------------------- SCREENSAVER UI ELEMENTS [END] ---------------------------------------- //

// ---------------------------------------- SCRIPT CONFIG RELATED FUNCTIONS [START] ---------------------------------------- //
function updateConfig() {
	config = {};
	Object.assign(config, defaultConfig);
	Object.assign(config, getHaPanelLovelaceConfig());
	const params = new URLSearchParams(window.location.search);
	for (let [key, value] of params) {
		if (key.startsWith("wpss_")) {
			key = key.substring(5);
			if (key in defaultConfig && value) {
				// Convert to the right type
				config[key] = defaultConfig[key].constructor(JSON.parse(value));
			}
		}
	}
	checkAndControlNightMode();
	if (isNightModeActive) {
		applyNightModeConfig();
	}

	if (config.info_template === undefined || config.info_template === null || config.info_template.constructor !== String || config.info_template === ``) {
		config.info_template = getDefaultInfoTemplate();
	}
	if (config.style === undefined || config.style === null || config.style.constructor !== Object || Object.keys(config.style).length <= 0) {
		config.style = getDefaultStyle();
	}
	if (config.image_url.startsWith("/")) {
		config.image_url = `media-source://media_source${config.image_url}`;
	}
	if (config.image_url.startsWith("media-source://media_source")) {
		config.image_url = config.image_url.replace(/\/+$/, '');
	}
	if (!config.enabled) {
		config.debug = false;
		config.hide_toolbar = false;
		config.hide_sidebar = false;
		config.fullscreen = false;
		config.idle_time = 0;
	}
}

function applyStyleConfig() {
	infoContainer.style.transition = `opacity ${3000}ms ease-in-out, background ${3000}ms ease-in-out;`;
	infoContainer.style.background = `rgba(0, 0, 0, ${config.screensaver_tint / 100})`;

	displayTintContainer.style.transition = `background ${3000}ms ease-in-out`;
	displayTintContainer.style.background = `rgba(0, 0, 0, ${config.display_tint / 100})`;

	screensaverContainer.style.transition = `opacity ${Math.round(config.fade_in_time * 1000)}ms ease-in-out`;
	infoBox.style.transition = `opacity ${Math.round((config.info_position_crossfade_time * 1000) / 2)}ms ease-in-out`;
	imageOne.style.transition = `opacity ${Math.round(config.crossfade_time * 1000)}ms ease-in-out`;
	imageTwo.style.transition = `opacity ${Math.round(config.crossfade_time * 1000)}ms ease-in-out`;
	imageOne.style.objectFit = config.image_fit;
	imageTwo.style.objectFit = config.image_fit;
	if (config.style) {
		for (const elId in config.style) {
			let el = document.getElementById(elId);
			if (el) {
				if (config.debug) console.debug(`Applying style for element: ${el}`);
				for (const attr in config.style[elId]) {
					el.style.setProperty(attr, config.style[elId][attr]);
				}
			}
		}
	}
}

function getHaPanelLovelace() {
	try {
		return elHaMain.shadowRoot
			.querySelector('app-drawer-layout partial-panel-resolver')
			.querySelector('ha-panel-lovelace')
	}
	catch (e) {
		console.error(e);
	}
}

function getHaPanelLovelaceConfig() {
	let pl = getHaPanelLovelace();
	if (pl && pl.lovelace && pl.lovelace.config && pl.lovelace.config.wallpanel_screensaver) {
		return pl.lovelace.config.wallpanel_screensaver;
	}
	return {}
}

function getDefaultInfoTemplate() {
	var dateTimeHtml;
	if (
		config.hour_12 === undefined
		|| config.hour_12 === null
		|| config.hour_12.constructor !== Boolean
	) {
		dateTimeHtml = `
	<div id="wallpanel-screensaver-info-time">{{ (new Date()).toLocaleTimeString(undefined, {hour: "2-digit", minute:"2-digit"}) }}</div>
	<div id="wallpanel-screensaver-info-date">{{ (new Date()).toLocaleDateString(undefined, {weekday: "short", year: "numeric", month: "short", day: "numeric"}) }}</div>
	`;
	}
	else {
		dateTimeHtml = `
	<div id="wallpanel-screensaver-info-time">{{ (new Date()).toLocaleTimeString(undefined, {hour: "2-digit", minute:"2-digit", hour12: config.hour_12}) }}</div>
	<div id="wallpanel-screensaver-info-date">{{ (new Date()).toLocaleDateString(undefined, {weekday: "short", year: "numeric", month: "short", day: "numeric"}) }}</div>
	`;
	}

	if (
		config.weather_entity === undefined
		|| config.weather_entity === null
		|| config.weather_entity.constructor !== String
		|| config.weather_entity === ''
	) {
		return dateTimeHtml;
	}
	else {
		return `
			<div id="wallpanel-screensaver-info-weather">
				<table>
					<tr>
						<th><img id="weather-temperature-icon" src="{{ filesParentPath }}/weather-icons/thermometer.svg"/></th>
						 <th>{{ states[config.weather_entity].attributes.temperature }}°&ensp;</th>
						 <th><img id="weather-state-icon" src="{{ filesParentPath }}/weather-icons/{{ states[config.weather_entity].state }}-sun-{{ states["sun.sun"].state.replace("_", "-"); }}.svg"/></th>
						  <th>{{ states[config.weather_entity].state.replace(/(^|\s)[A-Za-zÀ-ÖØ-öø-ÿ]/g, c => c.toUpperCase()) }}</th>
					</tr>
				</table>
			 </div>
		` + dateTimeHtml;
	}
}

function getDefaultStyle() {
	return {
		"wallpanel-screensaver-info-time": { "font-size": "15vh", "font-weight": "1200", "color": "#ffffff", "text-shadow": "-2.5px -2.5px 0 #000000, 2.5px -2.5px 0 #000000, -2.5px 2.5px 0 #000000, 2.5px 2.5px 0 #000000" },
		"wallpanel-screensaver-info-date": { "font-size": "8vh", "font-weight": "600", "color": "#ffffff", "text-shadow": "-2px -2px 0 #000000, 2px -2px 0 #000000, -2px 2px 0 #000000, 2px 2px 0 #000000" },
		"wallpanel-screensaver-info-weather": { "font-size": "5vh", "font-weight": "400", "color": "#ffffff", "text-shadow": "-1.5px -1.5px 0 #000000, 1.5px -1.5px 0 #000000, -1.5px 1.5px 0 #000000, 1.5px 1.5px 0 #000000", "display": "inline", "vertical-align": "top", "position": "relative", "left": "-36px" },
		"weather-temperature-icon": { "width": "64px", "height": "64px", "vertical-align": "middle", "position": "relative", "left": "12px" },
		"weather-state-icon": { "width": "64px", "height": "64px", "vertical-align": "middle" },
	}
}

function checkAndControlNightMode() {
	if (config.debug) console.debug('Checking for Night Mode config...');
	lastNightModeCheck = Date.now();

	if (config.night_mode === undefined || config.night_mode === null || config.night_mode.constructor !== Object || Object.keys(config.night_mode).length <= 0) {
		if (config.debug) console.debug('Night Mode disabled in config');
		isNightModeActive = false;
		return;
	}

	const nightModeConfig = config.night_mode;

	if (
		nightModeConfig.start_time === undefined || nightModeConfig.start_time === null || nightModeConfig.start_time.constructor !== String
		|| nightModeConfig.end_time === undefined || nightModeConfig.end_time === null || nightModeConfig.end_time.constructor !== String
	) {
		if (config.debug) console.debug('Night Mode start or end time not defined, disabling Night Mode...');
		isNightModeActive = false;
		return;
	}

	const configurableParams = ['start_time', 'end_time', 'idle_time', 'fade_in_time', 'crossfade_time', 'display_time', 'screensaver_tint', 'display_tint', 'keep_screen_on_time', 'black_screen_after_time', 'image_url', 'info_update_interval', 'info_position_update_interval', 'info_position_crossfade_time', 'style', 'info_template'];
	for (const param in nightModeConfig) {
		const paramIndexInConfigurableParams = configurableParams.indexOf(param);
		if (paramIndexInConfigurableParams < 0) {
			if (config.debug) console.debug(`Invalid parameter (${param}) found in Night Mode config, disabling Night Mode...`);
			isNightModeActive = false;
			return;
		}
	}

	const nightModeStartTime = stringTimeToMillis(nightModeConfig.start_time);
	const nightModeEndTime = stringTimeToMillis(nightModeConfig.end_time);

	if (nightModeStartTime <= 0 || nightModeEndTime <= 0) {
		if (config.debug) console.debug('Night Mode start or end time not defined properly, disabling Night Mode...');
		isNightModeActive = false;
		return;
	}

	const isNightModeActiveBefore = isNightModeActive;
	const currentDateTime = new Date();
	const currentTime = stringTimeToMillis(`${currentDateTime.getHours()}:${currentDateTime.getMinutes()}`);

	if (nightModeStartTime < nightModeEndTime) {
		isNightModeActive = (currentTime >= nightModeStartTime) && (currentTime < nightModeEndTime);
	}
	else if (nightModeStartTime > nightModeEndTime) {
		isNightModeActive = (currentTime >= nightModeStartTime) || (currentTime < nightModeEndTime);
	}
	else {
		isNightModeActive = true;
	}

	if (isNightModeActiveBefore != isNightModeActive) {
		if (config.debug) console.debug(`Night Mode status changed. Night Mode Activated: ${isNightModeActive}`);

		updateConfig();
		applyStyleConfig();
		setupScreensaver();

		if (config.idle_time > 0) {
			if (screensaverRunningSince) {
				restartScreensaver();
			}
			else {
				if (config.image_url.startsWith("media-source://media_source")) {
					updateImageList(preloadImages);
				}
				else {
					preloadImages();
				}
			}
		}
		else stopScreensaver();

		console.info(`Updated wallpanel config: ${JSON.stringify(config)}`);
	}
	else {
		if (config.debug) console.debug(`No change in Night Mode status. Night Mode Activated: ${isNightModeActive}`);
	}
}

/**
 * NOTE: Should be called only if `isNightModeActive = true`. 
 */
function applyNightModeConfig() {
	if (config.debug) console.debug('Applying night mode config...');

	const nightModeConfig = JSON.parse(JSON.stringify(config.night_mode));

	delete nightModeConfig.start_time;
	delete nightModeConfig.end_time;

	Object.assign(config, nightModeConfig);
}

function getScriptParentPath() {
	const scriptName = 'wallpanel-screensaver.js';
	const scripts = document.getElementsByTagName('script');

	for (var i = (scripts.length - 1); i >= 0; i--) {
		const src = scripts[i].src;
		if (src && (src.indexOf(scriptName) >= 0)) {
			const scriptUrl = new URL(src);
			return scriptUrl.pathname.substring(0, scriptUrl.pathname.lastIndexOf("/"));
		}
	}
	return '';
}

/**
 * Supports HH:MM format
 * @param {String} stringTime 
 */
function stringTimeToMillis(stringTime) {
	let millis;

	if (stringTime.split(":").length === 2) {
		millis = Number(stringTime.split(":")[0]) * 3600000 + Number(stringTime.split(":")[1]) * 60000;
	} else {
		millis = -1;
	}

	return millis;
}
// ---------------------------------------- SCRIPT CONFIG RELATED FUNCTIONS [END] ---------------------------------------- //

// ---------------------------------------- MAIN LOOP AND EVENTS [START] ---------------------------------------- //
window.setInterval(() => {
	if (screensaverRunningSince) {
		let now = Date.now();

		if (config.black_screen_after_time > 0 && now - screensaverRunningSince >= config.black_screen_after_time * 1000) {
			if (imageOne.style.visibility != 'hidden' || imageTwo.style.visibility != 'hidden' || infoContainer.style.visibility != 'hidden') {
				if (config.debug) console.debug("Setting screen to black");
				imageOne.style.opacity = 0;
				imageTwo.style.opacity = 0;
				infoContainer.style.opacity = 0;

				const isNightModeActiveBefore = isNightModeActive;

				setTimeout(function () {
					if (screensaverRunningSince && isNightModeActive === isNightModeActiveBefore) {
						imageOne.style.visibility = 'hidden';
						imageTwo.style.visibility = 'hidden';
					}
				}, Math.round(config.crossfade_time * 1000));

				setTimeout(function () {
					if (screensaverRunningSince && isNightModeActive === isNightModeActiveBefore) {
						infoContainer.style.visibility = 'hidden';
					}
				}, 3000);
			}
		}
		else {
			if (now - lastImageUpdate >= config.display_time * 1000) {
				switchActiveImage();
			}
			if (config.info_update_interval > 0 && now - lastInfoUpdate >= config.info_update_interval * 1000) {
				updateInfo();
			}
			if (config.info_position_update_interval > 0 && now - lastInfoPositionUpdate >= config.info_position_update_interval * 1000) {
				updateInfoBoxPosition();
			}
		}

		if (screenWakeLock.enabled && now - screensaverRunningSince >= config.keep_screen_on_time * 1000) {
			screenWakeLock.disable();
		}

		if (now - lastNightModeCheck >= config.night_mode_check_interval * 1000) {
			checkAndControlNightMode();
		}
	}
	else {
		let pl = getHaPanelLovelace();
		if (pl && pl.panel && pl.panel.url_path) {
			if (activePanel != pl.panel.url_path) {
				if (config.debug) console.debug(`Active panel switched from '${activePanel}' to '${pl.panel.url_path}'`);
				activePanel = pl.panel.url_path;
				updateConfig();
				debugBox.style.visibility = config.debug ? 'visible' : 'hidden';
				setToolbarHidden(config.hide_toolbar);
				setSidebarHidden(config.hide_sidebar);
				applyStyleConfig();
				console.info(`Wallpanel config: ${JSON.stringify(config)}`);
				if (config.idle_time > 0) {
					if (config.image_url.startsWith("media-source://media_source")) {
						updateImageList(preloadImages);
					}
					else {
						preloadImages();
					}
				}
			}
			if (config.idle_time > 0 && Date.now() - idleSince >= config.idle_time * 1000) {
				startScreensaver();
			}
		}
		else if (activePanel) {
			debugBox.style.visibility = 'hidden';
			setSidebarHidden(false);
			setToolbarHidden(false);
			activePanel = null;
		}
	}

	if (config.debug) {
		debugBox.innerHTML = '';
		debugBox.innerHTML += `Version: ${version}<br/>`
		debugBox.innerHTML += `Config: ${JSON.stringify(config)}<br/>`;
		debugBox.innerHTML += `Fullscreen: ${fullscreen}<br/>`;
		debugBox.innerHTML += `Screensaver running since: ${screensaverRunningSince}<br/>`;
		debugBox.innerHTML += `Screen wake lock: enabled=${screenWakeLock.enabled} lock=${screenWakeLock._lock} player=${screenWakeLock._player} error=${screenWakeLock.error}<br/>`;
		if (screenWakeLock._player) {
			let p = screenWakeLock._player;
			debugBox.innerHTML += `Screen wake lock video: readyState=${p.readyState} currentTime=${p.currentTime} paused=${p.paused} ended=${p.ended}<br/>`;
		}
		debugBox.scrollTop = debugBox.scrollHeight;
	}
}, 1000);

document.addEventListener('fullscreenerror', (event) => {
	console.error('Failed to enter fullscreen');
});

document.addEventListener('fullscreenchange', (event) => {
	fullscreen = Boolean(document.fullscreenElement);
});

window.addEventListener('click', e => {
	handleInteractionEvent(e, true);
}, false);

window.addEventListener('touchstart', e => {
	handleUnwantedInteractionEvent(e);
}, false);

window.addEventListener('touchmove', e => {
	handleUnwantedInteractionEvent(e);
}, false);

window.addEventListener('touchcancel', e => {
	handleUnwantedInteractionEvent(e);
}, false);

window.addEventListener('touchend', e => {
	handleInteractionEvent(e, true);
}, false);

window.addEventListener('mousemove', e => {
	handleInteractionEvent(e, false);
}, false);

window.addEventListener('wheel', e => {
	handleInteractionEvent(e, false);
}, false);

window.addEventListener('keydown', e => {
	handleInteractionEvent(e, false);
}, false);

function handleInteractionEvent(e, isClick) {
	hideMessage();
	idleSince = Date.now();
	if (isClick) {
		setupScreensaver();
	}
	if (screensaverRunningSince) {
		e.preventDefault();
		e.stopPropagation();

		let x = e.clientX;
		let right = 0.0;
		if (!x && e.changedTouches && e.changedTouches[0]) {
			x = e.changedTouches[0].clientX;
		}
		if (x) {
			right = (screensaverContainer.clientWidth - x) / screensaverContainer.clientWidth;
		}
		if (right <= 0.05) {
			if (isClick && new Date() - lastImageUpdate > config.crossfade_time * 1000 + 1000) {
				switchActiveImage();
			}
		}
		else {
			stopScreensaver();
		}
	}
}

function handleUnwantedInteractionEvent(e) {
	if (screensaverRunningSince) {
		e.preventDefault();
		e.stopPropagation();
	}
}
// ---------------------------------------- MAIN LOOP AND EVENTS [END] ---------------------------------------- //

// ---------------------------------------- WALLPANEL SPECIFIC FUNCTIONS [START] ---------------------------------------- //
function enterFullscreen() {
	if (config.debug) console.debug("Enter fullscreen");
	// Will need user input event to work
	let el = document.documentElement;
	if (el.requestFullscreen) {
		el.requestFullscreen();
	}
	else if (el.mozRequestFullScreen) {
		el.mozRequestFullScreen();
	}
	else if (el.msRequestFullscreen) {
		el.msRequestFullscreen();
	}
	else if (el.webkitRequestFullscreen) {
		el.webkitRequestFullscreen();
	}
}

function setSidebarHidden(hidden) {
	try {
		elHaMain.shadowRoot.querySelector("app-drawer-layout > app-drawer > ha-sidebar")
			.style.visibility = (hidden ? "hidden" : "visible");
		if (hidden) {
			elHaMain.style.setProperty("--app-drawer-width", 0);
		}
		else {
			elHaMain.style.removeProperty("--app-drawer-width");
		}
		window.dispatchEvent(new Event('resize'));
	}
	catch (e) {
		console.error(e);
	}
}

function setToolbarHidden(hidden) {
	try {
		let appToolbar = elHaMain.shadowRoot
			.querySelector("app-drawer-layout > partial-panel-resolver > ha-panel-lovelace").shadowRoot
			.querySelector("hui-root").shadowRoot
			.querySelector("ha-app-layout > app-header > app-toolbar");
		if (hidden) {
			appToolbar.style.setProperty("display", "none");
		}
		else {
			appToolbar.style.removeProperty("display");
		}
		window.dispatchEvent(new Event('resize'));
	}
	catch (e) {
		console.error(e);
	}
}
// ---------------------------------------- WALLPANEL SPECIFIC FUNCTIONS [END] ---------------------------------------- //

// ---------------------------------------- SCREENSAVER SPECIFIC FUNCTIONS [START] ---------------------------------------- //
function startScreensaver() {
	if (config.debug) console.debug("Start screensaver");

	updateConfig();
	applyStyleConfig();

	setupScreensaver();
	if (config.keep_screen_on_time > 0) {
		setTimeout(function () {
			if (screensaverRunningSince && !screenWakeLock.enabled) {
				console.error("Keep screen on will not work because the user didn't interact with the document first. https://goo.gl/xX8pDD");
				displayMessage("Please interact with the screen for a moment to request wake lock.", 15000)
			}
		}, 3000);
	}

	lastImageUpdate = Date.now();
	screensaverRunningSince = Date.now();
	if (document.body.style.overflow != 'hidden') {
		bodyOverflowOrig = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
	}

	infoContainer.style.visibility = 'visible';
	infoContainer.style.opacity = 1;
	imageOne.style.visibility = 'visible';
	imageTwo.style.visibility = 'visible';
	screensaverContainer.style.visibility = 'visible';
	screensaverContainer.style.opacity = 1;

	const imageUrl = config.image_url;
	if (imageUrl !== null && imageUrl !== '') {
		imageOne.style.opacity = 1;
		imageTwo.style.opacity = 1;
	}
	else {
		imageOne.style.opacity = 0;
		imageTwo.style.opacity = 0;
	}

	if (config.info_update_interval > 0) {
		updateInfo();
	}
	else {
		infoBox.innerHTML = '';
	}
}

function restartScreensaver() {
	if (config.debug) console.debug("Restart screensaver");

	if (config.keep_screen_on_time > 0) {
		setTimeout(function () {
			if (screensaverRunningSince && !screenWakeLock.enabled) {
				console.error("Keep screen on will not work because the user didn't interact with the document first. https://goo.gl/xX8pDD");
				displayMessage("Please interact with the screen for a moment to request wake lock.", 15000)
			}
		}, 3000);
	}

	screensaverRunningSince = Date.now();
	lastImageUpdate = Date.now();
	lastInfoUpdate = Date.now();
	lastInfoPositionUpdate = Date.now();

	infoContainer.style.visibility = 'visible';
	infoContainer.style.opacity = 1;
	imageOne.style.visibility = 'visible';
	imageTwo.style.visibility = 'visible';

	imageOne.style.opacity = 0;
	imageTwo.style.opacity = 0;

	setTimeout(function () {
		if (screensaverRunningSince) {
			if (config.image_url.startsWith("media-source://media_source")) {
				updateImageList(preloadImages);
			}
			else {
				preloadImages();
			}
			setTimeout(function () {
				if (screensaverRunningSince) {
					imageOne.style.opacity = 1;
					imageTwo.style.opacity = 1;
					switchActiveImage();
				}
			}, 6000);
		}
	}, Math.round(config.crossfade_time * 1000));

	infoBox.style.opacity = 0;

	setTimeout(function () {
		if (screensaverRunningSince) {
			if (config.info_update_interval > 0) {
				updateInfo();
			}
			else {
				infoBox.innerHTML = '';
			}
		}
		infoBox.style.opacity = 1;
	}, Math.round((config.info_position_crossfade_time * 1000) / 2));
}

function stopScreensaver() {
	if (config.debug) console.debug("Stop screensaver");

	screensaverRunningSince = null;
	document.body.style.overflow = bodyOverflowOrig;

	screensaverContainer.style.visibility = 'hidden';
	infoContainer.style.visibility = 'hidden';
	imageOne.style.visibility = 'hidden';
	imageTwo.style.visibility = 'hidden';
	screensaverContainer.style.opacity = 0;

	idleSince = Date.now();
	if (screenWakeLock.enabled) {
		screenWakeLock.disable();
	}
}

function setupScreensaver() {
	if (config.debug) console.debug("Setup screensaver");
	if (config.fullscreen && !fullscreen) {
		enterFullscreen();
	}
	if (config.keep_screen_on_time > 0 && !screenWakeLock.enabled) {
		screenWakeLock.enable();
		/*
		setTimeout(function() { 
			if (screenWakeLock.enabled) {
				displayMessage("Screen will stay on.", 1000)
			}
		}, 3000);
		*/
	}
}

function preloadImages() {
	if (config.debug) console.debug("Preloading images");
	updateImage(imageOne);
	setTimeout(function () {
		updateImage(imageTwo);
	}, 3000);
}

function updateImage(img) {
	if (config.image_url.startsWith("media-source://media_source")) {
		return updateImageFromMediaSource(img);
	}
	else {
		return updateImageFromUnsplash(img);
	}
}

function switchActiveImage() {
	lastImageUpdate = Date.now();

	let curActive = imageOne;
	let newActive = imageTwo;
	if (imageTwo.style.opacity == 1) {
		curActive = imageTwo;
		newActive = imageOne;
	}

	const imageUrl = config.image_url;
	if (imageUrl === null || imageUrl === '') {
		if (config.debug) console.debug('Image URL is null or blank. Disabling image views...');

		curActive.style.opacity = 0;
		newActive.style.opacity = 0;
	}
	else {
		if (config.debug) console.debug(`Switching active image to '${newActive.id}'`);

		if (newActive.style.opacity != 1) {
			newActive.style.opacity = 1;
		}
		if (curActive.style.opacity != 0) {
			curActive.style.opacity = 0;
		}
	}

	// Load next image after fade out
	setTimeout(function () {
		if (imageUrl !== null && imageUrl !== '')
			updateImage(curActive);
	}, Math.round(config.crossfade_time * 1000) + 500);
}

// ############## LOCAL IMAGES FETCH [START] ############## //
function updateImageFromMediaSource(img) {
	if (imageList.length == 0) {
		return;
	}
	imageIndex++;
	if (imageIndex >= imageList.length) {
		imageIndex = 0;
	}
	let imagePath = imageList[imageIndex];
	if (!imagePath) {
		return;
	}
	imagePath = imagePath.replace(/^media-source:\/\/media_source/, '/media');
	elHass.__hass.callWS({
		type: "auth/sign_path",
		path: imagePath,
		expires: 5
	}).then(
		result => {
			img.src = `${document.location.origin}${result.path}`;
		}
	);
}

function findImages(mediaContentId) {
	console.debug(`findImages: ${mediaContentId}`);
	return new Promise(
		function (resolve, reject) {
			elHass.__hass.callWS({
				type: "media_source/browse_media",
				media_content_id: mediaContentId
			}).then(
				mediaEntry => {
					//console.debug(mediaEntry);
					var promises = mediaEntry.children.map(child => {
						if (child.media_class == "image") {
							//console.debug(child);
							return child.media_content_id;
						}
						if (child.media_class == "directory") {
							return findImages(child.media_content_id);
						}
					});
					Promise.all(promises).then(results => {
						let result = [];
						for (let res of results) {
							result = result.concat(res);
						}
						resolve(result);
					})
				},
				error => {
					//console.warn(error);
					reject(error);
				}
			);
		}
	);
}

function updateImageList(callback) {
	if (!config.image_url.startsWith("media-source://media_source")) return;
	let mediaContentId = config.image_url;
	findImages(mediaContentId).then(
		result => {
			imageList = result.sort();
			if (config.debug) {
				console.debug("Image list is now:");
				console.debug(imageList);
			}
			if (callback) {
				callback();
			}
		},
		error => {
			error = `Failed to update image list from ${config.image_url}: ${JSON.stringify(error)}`;
			console.error(error);
			displayMessage(error, 10000)
		}
	)
}
// ############## LOCAL IMAGES FETCH [END] ############## //

// ############## FETCH IMAGES FROM UNSPLASH [START] ############## //
function updateImageFromUnsplash(img) {
	let width = screensaverContainer.clientWidth;
	let height = screensaverContainer.clientHeight;
	let timestamp = Math.floor(Date.now() / 1000);
	let imageUrl = config.image_url;
	imageUrl = imageUrl.replace(/\${width}/g, width);
	imageUrl = imageUrl.replace(/\${height}/g, height);
	imageUrl = imageUrl.replace(/\${timestamp}/g, timestamp);
	if (config.debug) console.debug(`Updating image '${img.id}' from '${imageUrl}'`);
	img.src = imageUrl;
}
// ############## FETCH IMAGES FROM UNSPLASH [END] ############## //

function updateInfo() {
	if (config.debug) console.debug("Updating info");

	lastInfoUpdate = Date.now();

	let html = config.info_template;
	let states = elHass.__hass.states;
	html = html.replace(/{{s*(.+?)\s*}}/g, function (match, expression, offset, string) {
		try {
			return eval(expression);
		}
		catch (err) {
			console.warn(err);
			return err;
		}
	});
	infoBox.innerHTML = html;

	applyStyleConfig();
}

function updateInfoBoxPosition() {
	if (config.debug) console.debug("Updating info position");
	lastInfoPositionUpdate = Date.now();

	if (infoBox.style.opacity == 0) {
		const allowedMinWidth = 0
		const allowedMinHeight = 0
		const allowedMaxWidth = window.innerWidth - (0.5 * window.innerWidth);
		const allowedMaxHeight = window.innerHeight - (0.5 * window.innerHeight);
		const randomLeftPos = Math.floor(Math.random() * (allowedMaxWidth - allowedMinWidth + 1)) + allowedMinWidth;
		const randomTopPos = Math.floor(Math.random() * (allowedMaxHeight - allowedMinHeight + 1)) + allowedMinHeight;

		infoBox.style.position = "relative";
		infoBox.style.left = `${randomLeftPos}px`;
		infoBox.style.top = `${randomTopPos}px`;

		infoBox.style.opacity = 1;
	}
	else {
		infoBox.style.opacity = 0;

		setTimeout(function () {
			updateInfoBoxPosition();
		}, Math.round((config.info_position_crossfade_time * 1000) / 2));
	}
}
// ---------------------------------------- SCREENSAVER SPECIFIC FUNCTIONS [END] ---------------------------------------- //

// ---------------------------------------- NOTIFICATIONS AND DEBUG RELATED FUNCTIONS [START] ---------------------------------------- //
function displayMessage(message, timeout = 15000) {
	hideMessage();
	messageBox.innerHTML = message;
	messageBox.style.visibility = 'visible';
	messageBoxTimeout = setTimeout(function () {
		hideMessage();
	}, timeout);
}

function hideMessage() {
	if (!messageBoxTimeout) {
		return;
	}
	clearTimeout(messageBoxTimeout);
	messageBoxTimeout = null;
	messageBox.style.visibility = 'hidden';
	messageBox.innerHTML = '';
}
// ---------------------------------------- NOTIFICATIONS AND DEBUG RELATED FUNCTIONS [END] ---------------------------------------- //
const playIconContainer = document.getElementById('play-icon');
const audioPlayerContainer = document.getElementById('audio-player-container');
const seekSlider = document.getElementById('seek-slider');
let playState = 'play';
let muteState = 'unmute';
let allButtons = document.querySelectorAll('button');


audioPlayerContainer.style.setProperty('--seek-before-width', "0%");

for (var i = 0; i < allButtons.length; i++) {
    allButtons[i].addEventListener('click', function() {
        this.classList.toggle("active");
    });
}

playIconContainer.addEventListener('click', () => {

    if(playState === 'play') {
        audio.play();
        requestAnimationFrame(whilePlaying);
        playState = 'pause';
    } else {
        audio.pause();
        cancelAnimationFrame(raf);
        playState = 'play';
    }
});

const showRangeProgress = (rangeInput) => {
    if(rangeInput === seekSlider) audioPlayerContainer.style.setProperty('--seek-before-width', rangeInput.value / rangeInput.max * 100 + '%');
}

seekSlider.addEventListener('input', (e) => {
    showRangeProgress(e.target);
});

/* Implementation of the functionality of the audio player */

const audio = document.querySelector('audio');
const durationContainer = document.getElementById('duration');
const currentTimeContainer = document.getElementById('current-time');
let raf = null;

const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${returnedSeconds}`;
}

const displayDuration = () => {
    durationContainer.textContent = calculateTime(audio.duration);
}

const setSliderMax = () => {
    seekSlider.max = Math.floor(audio.duration);
}

const displayBufferedAmount = () => {
    const bufferedAmount = Math.floor(audio.buffered.end(audio.buffered.length - 1));
    audioPlayerContainer.style.setProperty('--buffered-width', `${(bufferedAmount / seekSlider.max) * 100}%`);
}

const whilePlaying = () => {
    seekSlider.value = Math.floor(audio.currentTime);
    currentTimeContainer.textContent = calculateTime(seekSlider.value);
    audioPlayerContainer.style.setProperty('--seek-before-width', `${seekSlider.value / seekSlider.max * 100}%`);
    raf = requestAnimationFrame(whilePlaying);
}

if (audio.readyState > 0) {
    displayDuration();
    setSliderMax();
    displayBufferedAmount();
} else {
    audio.addEventListener('loadedmetadata', () => {
        displayDuration();
        setSliderMax();
        displayBufferedAmount();
    });
}

audio.addEventListener('progress', displayBufferedAmount);

seekSlider.addEventListener('input', () => {
    currentTimeContainer.textContent = calculateTime(seekSlider.value);
    if(!audio.paused) {
        cancelAnimationFrame(raf);
    }
});

seekSlider.addEventListener('change', () => {
    audio.currentTime = seekSlider.value;
    if(!audio.paused) {
        requestAnimationFrame(whilePlaying);
    }
});


/* Implementation of the Media Session API */
if('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => {
        if(playState === 'play') {
            audio.play();
            requestAnimationFrame(whilePlaying);
            playState = 'pause';
        } else {
            audio.pause();
            cancelAnimationFrame(raf);
            playState = 'play';
        }
    });
    navigator.mediaSession.setActionHandler('pause', () => {
        if(playState === 'play') {
            audio.play();
            requestAnimationFrame(whilePlaying);
            playState = 'pause';
        } else {
            audio.pause();
            cancelAnimationFrame(raf);
            playState = 'play';
        }
    });
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        audio.currentTime = audio.currentTime - (details.seekOffset || 10);
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
        audio.currentTime = audio.currentTime + (details.seekOffset || 10);
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.fastSeek && 'fastSeek' in audio) {
          audio.fastSeek(details.seekTime);
          return;
        }
        audio.currentTime = details.seekTime;
    });
    navigator.mediaSession.setActionHandler('stop', () => {
        audio.currentTime = 0;
        seekSlider.value = 0;
        audioPlayerContainer.style.setProperty('--seek-before-width', '0%');
        currentTimeContainer.textContent = '0:00';
        if(playState === 'pause') {
            cancelAnimationFrame(raf);
            playState = 'play';
        }
    });
}

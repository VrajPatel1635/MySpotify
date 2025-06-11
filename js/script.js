console.log("Let's write JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Convert seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Get list of songs from the album's info.json
async function getSongs(folder) {
    currFolder = folder;

    try {
        let res = await fetch(`${folder}/info.json`);
        let data = await res.json();
        songs = data.songs;

        let songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";

        for (const song of songs) {
            songUL.innerHTML += `
                <li>
                    <img class="invert" width="34" src="image/music.svg" alt="">
                    <div class="info">
                        <div>${decodeURIComponent(song)}</div>
                        <div>Vraj</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="image/play.svg" alt="">
                    </div>
                </li>`;
        }

        // Add click listeners to each song item
        Array.from(document.querySelectorAll(".songList li")).forEach((e, i) => {
            e.addEventListener("click", () => {
                playMusic(songs[i]);
            });
        });

        return songs;

    } catch (err) {
        console.error("Could not load songs from:", folder, err);
        return [];
    }
}

// Play a specific music track
const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "image/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Display all album cards by reading albumList.json
async function displayAlbums() {
    console.log("Displaying albums");

    try {
        let res = await fetch("songs/albumList.json");
        let folders = await res.json();

        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        for (let folder of folders) {
            try {
                let res = await fetch(`songs/${folder}/info.json`);
                let data = await res.json();

                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>

                        <img src="songs/${folder}/cover.jpeg" alt="">
                        <h2>${data.title}</h2>
                        <p>${data.description}</p>
                    </div>`;
            } catch (err) {
                console.warn(`Missing or broken info.json in: ${folder}`, err);
            }
        }

        // Add click event to album cards
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                if (songs.length > 0) playMusic(songs[0]);
            });
        });

    } catch (err) {
        console.error("Error fetching album list", err);
    }
}

// Main logic
async function main() {
    await getSongs("songs/HappyHits"); // Load default album
    playMusic(songs[0], true);
    await displayAlbums();

    // Play/Pause functionality
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "image/pause.svg";
        } else {
            currentSong.pause();
            play.src = "image/play.svg";
        }
    });

    // Update time & seek bar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click control
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Mobile menu controls
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Previous button
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Next button
    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Volume slider control
    document.querySelector(".range input").addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume img").src = "image/volume.svg";
        }
    });

    // Volume mute/unmute toggle
    document.querySelector(".volume img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "image/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "image/volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

// Call the main function to start the app
main();

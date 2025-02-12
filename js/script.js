console.log('start');

let currentSong = new Audio();
let songs;
let currFolder = "base_songs";

async function getSongs(folder) {
    currFolder = folder
    
    let a = await fetch(`/songs/${currFolder}/`);
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    //Creating an array of songs
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }
    }

    //Show all song names in the songlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (let song of songs) {
        song = song.replaceAll("%20", " ")
        song = song.replaceAll("%2C", ",")
        songUl.innerHTML = songUl.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song}</div>
                                <div>Vedant</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                        </li>`
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    return songs
}

//Function for playing the song
const playMusic = (track, pause = false) => {
    currentSong.src = `songs/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/playbar_pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

// Function to convert sec to minutes
const timeconvert = (time) => {
    if (isNaN(time)) {
        return "00:00";
    }

    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);

    minutes = String(minutes).padStart(2, "0")
    seconds = String(seconds).padStart(2, "0")

    let ans = `${minutes}:${seconds}`
    return ans;
}

//function to play previous song
function playprevious() {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

    // if(index-1 == 0){
    //     document.querySelector("#previous").src = ""
    // }else{
    //     document.querySelector("#next").src = "playbar_forward.svg"
    // }

    if ((index - 1) < 0) {
        playMusic(songs[songs.length - 1])
    } else {
        playMusic(songs[index - 1])
    }
}

//function to play next song
function playnext() {
    console.log(songs);

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

    // if(index+1 == songs.length-1){
    //     document.querySelector("#next").src = ""
    // }else{
    //     document.querySelector("#previous").src = "playbar_back.svg"
    // }

    if ((index + 1) >= songs.length) {
        playMusic(songs[0])

    } else {
        playMusic(songs[index + 1])
    }
}

async function displayalbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")

    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            //get data inside the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg class="w-[40px] h-[40px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="black" viewBox="0 0 24 24">
                                <path stroke="#141B34" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 18V6l8 6-8 6Z"/>
                            </svg>
                        </div>
                        <img aria-hidden="false" draggable="false" loading="lazy" src="songs/${folder}/cover.jpg" data-testid="card-image" alt="" class="mMx2LUixlnN_Fu45JpFB yMQTWVwLJ5bV8VGiaqU3 Yn2Ei5QZn19gria6LjZj">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // Folder functionality
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`) 
            playMusic(songs[0])
        })
    })
}

async function main() {

    //get the list of all songs 
    await getSongs(currFolder)
    playMusic(songs[0], true)

    //Display all the albums on the card container
    displayalbums()

    //Event listner for play button
    play.addEventListener("click", (element) => {
        if (currentSong.paused) {
            play.src = "img/playbar_pause.svg"
            currentSong.play()
        } else {
            play.src = "img/playbar_play.svg"
            currentSong.pause()
        }
    })

    //Time update event for song time
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${timeconvert(currentSong.currentTime)} / ${timeconvert(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Event listener for the seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentSong.currentTime = currentSong.duration * (e.offsetX / e.target.getBoundingClientRect().width)
    })

    //Eventlistner for hamburger button
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Eventlistner for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Eventlistners for previous and next 
    previous.addEventListener("click", () => {
        playprevious()
    })
    next.addEventListener("click", () => {
        playnext()
    })

    //volume rocker functionality
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = (e.target.value) / 100
        if (e.target.value == 0) {
            document.querySelector("#volumebtn").src = "img/mute.svg"
        } else if (e.target.value < 31) {
            document.querySelector("#volumebtn").src = "img/lowvolume.svg"
        } else {
            document.querySelector("#volumebtn").src = "img/volume.svg"
        }
    })

    //mute volume functionality
    document.querySelector("#volumebtn").addEventListener("click", (e) => {
        range = document.querySelector("input").value

        if (range == 0) {
            e.target.src = "img/lowvolume.svg"
            document.querySelector("input").value = 30
            currentSong.volume = 0.3

        } else {
            e.target.src = "img/mute.svg"
            document.querySelector("input").value = 0
            currentSong.volume = 0
        }
    })

}

main()


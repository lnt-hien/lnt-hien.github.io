$(function()
{
    var playerTrack = $("#player-track");
	var bgArtwork = $('#bg-artwork');
	var bgArtworkUrl;
	var albumName = $('#album-name');
	var trackName = $('#track-name');
	var albumArt = $('#album-art'),
		progressBar = $('#progress-bar'),
		seekBar = $('#seek-bar'),
		trackTime = $('#track-time'),
		insTime = $('#ins-time'),
		sHover = $('#s-hover'),
		currTrackTime = $('#current-time'),
		durTrackTime = $('#track-length'),
		seekLocation, seekTime, progressBarPos, cM, ctMinutes, ctSeconds, curMinutes, curSeconds, durMinutes, durSeconds, playProgress, bTime, nTime = 0,
		buffInterval = null, tFlag = false, isShuffled = false;
	
    var playPauseButton = $("#play-pause"), 
        i = playPauseButton.find('i'),
        playPreviousTrackButton = $('#play-previous'), 
        playNextTrackButton = $('#play-next'),
        shuffleButton = $('#shuffle'), 
        repeatButton = $('#repeat'),
        currIndex = -1,
        isRepeatedOnce = false, 
        isRepeatedAll = false;

	
	var songList = [{
            artist: "Us The Duo",
            name: "No Matter Where You Are",
            url: "Musics/NoMatterWhereYouAre.mp3",
            picture: "https://raw.githubusercontent.com/himalayasingh/music-player-1/master/img/_1.jpg"
        },
        {
            artist: "Michael Pangilinan",
            name: "Rainbow (Cover)",
            url: "Musics/Rainbow.mp3",
            picture: "https://raw.githubusercontent.com/himalayasingh/music-player-1/master/img/_1.jpg"
        },
        {
            artist: "Tori Kelly",
            name: "Beautiful Things",
            url: "Musics/BeautifulThings.mp3",
            picture: "https://raw.githubusercontent.com/himalayasingh/music-player-1/master/img/_1.jpg"
        },
        {
            artist: "Calum Scott",
            name: "You Are The Reason",
            url: "Musics/YouAreTheReason.mp3",
            picture: "https://raw.githubusercontent.com/himalayasingh/music-player-1/master/img/_1.jpg"
        }
        ];

    function spinLoad()
    {
    setTimeout(function() {
            $('.spinner').fadeOut();
            $('#preloader').delay(500).fadeOut('slow');
        }, 1000);
    }

    spinLoad();

    function shuffle() 
    {
        if(isShuffled) 
        {
            var j, x, i;

            var shuffledSongs = JSON.parse(JSON.stringify(songList));  /*Cloning songList obj*/
            
            for (i = shuffledSongs.length - 1; i > 0; i--) 
            {
                j = Math.floor(Math.random() * (i + 1));

                if( i == currIndex )
                {
                    x = shuffledSongs[currIndex];
                    shuffledSongs[currIndex] = shuffledSongs[j];
                    shuffledSongs[j] = x;
                    
                    k = currIndex;
                    currIndex = j;
                    j = k;
                }
                else if( j == currIndex )
                {
                    x = shuffledSongs[i];
                    shuffledSongs[i] = shuffledSongs[currIndex];
                    shuffledSongs[currIndex] = x;
                    
                    k = i;
                    i = currIndex;
                    currIndex = k;
                }
                else
                {
                    x = shuffledSongs[i];
                    shuffledSongs[i] = shuffledSongs[j];
                    shuffledSongs[j] = x;
                }
            }

            shuffleButton.addClass('active');
            isShuffled = false;
            playedSongs = shuffledSongs;
            console.log(playedSongs);
        }
        else
        {
            shuffleButton.removeClass('active');
            isShuffled = true;
            playedSongs = songList;
            console.log(playedSongs);
        }

        return playedSongs;
    }
    
    // playedSongs = shuffle();

    function playPause()
    {
        setTimeout(function() 
        {
            if(audio.paused)
            {
                playerTrack.addClass('active');
                albumArt.addClass('active');
                checkBuffering();
                i.attr('class','fas fa-pause');
                audio.play();
            }
            else
            {
                playerTrack.removeClass('active');
                albumArt.removeClass('active');
                clearInterval(buffInterval);
                albumArt.removeClass('buffering');
                i.attr('class','fas fa-play');
                audio.pause();
            }
        },300);
    }
    	
	function showHover(event)
	{
		progressBarPos = progressBar.offset(); 
		seekLocation = event.clientX - progressBarPos.left;
		seekTime = audio.duration * (seekLocation / progressBar.outerWidth());
		
		sHover.width(seekLocation);
		
		cM = seekTime / 60;
		
		ctMinutes = Math.floor(cM);
		ctSeconds = Math.floor(seekTime - ctMinutes * 60);
		
		if( (ctMinutes < 0) || (ctSeconds < 0) )
			return;
		
		if(ctMinutes < 10)
			ctMinutes = '0' + ctMinutes;
		if(ctSeconds < 10)
			ctSeconds = '0' + ctSeconds;
        
        if( isNaN(ctMinutes) || isNaN(ctSeconds) )
            insTime.text('--:--');
        else
		    insTime.text(ctMinutes + ':' + ctSeconds);
            
		insTime.css({'left':seekLocation,'margin-left':'0px'}).fadeIn(0);
	}

    function hideHover()
	{
        sHover.width(0);
        insTime.text('00:00').css({'left':'0px','margin-left':'0px'}).fadeOut(0);		
    }
    
    function playFromClickedPos()
    {
        audio.currentTime = seekTime;
		seekBar.width(seekLocation);
		hideHover();
    }

    function updateCurrTime()
	{
        nTime = new Date();
        nTime = nTime.getTime();

        if( !tFlag )
        {
            tFlag = true;
            trackTime.addClass('active');
        }

		curMinutes = Math.floor(audio.currentTime / 60);
		curSeconds = Math.floor(audio.currentTime - curMinutes * 60);
		
		durMinutes = Math.floor(audio.duration / 60);
		durSeconds = Math.floor(audio.duration - durMinutes * 60);
		
		playProgress = (audio.currentTime / audio.duration) * 100;
		
		if(curMinutes < 10)
			curMinutes = '0' + curMinutes;
		if(curSeconds < 10)
			curSeconds = '0' + curSeconds;
		
		if(durMinutes < 10)
			durMinutes = '0' + durMinutes;
		if(durSeconds < 10)
			durSeconds = '0' + durSeconds;
        
        if( isNaN(curMinutes) || isNaN(curSeconds) )
            currTrackTime.text('00:00');
        else
		    currTrackTime.text(curMinutes + ':' + curSeconds);
        
        if( isNaN(durMinutes) || isNaN(durSeconds) )
            durTrackTime.text('00:00');
        else
		    durTrackTime.text(durMinutes + ':' + durSeconds);
        
        if( isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds) )
            trackTime.removeClass('active');
        else
            trackTime.addClass('active');

        
		seekBar.width(playProgress+'%');
		
		if( playProgress == 100 )
		{
			i.attr('class','fa fa-play');
			seekBar.width(0);
            currTrackTime.text('00:00');
            albumArt.removeClass('buffering').removeClass('active');
            clearInterval(buffInterval);
            if( !isRepeatedAll && !isRepeatedOnce )    
                selectTrack(1);
            else if ( isRepeatedOnce )
            {
                --currIndex;
                selectTrack(1);
                isRepeatedOnce = false;
                isRepeatedAll = true;
                repeatButton.removeClass('active');
            }
            else
                --currIndex; 
                selectTrack(1);
		}
    }
    
    function checkBuffering()
    {
        clearInterval(buffInterval);
        buffInterval = setInterval(function()
        { 
            if( (nTime == 0) || (bTime - nTime) > 1000  )
                albumArt.addClass('buffering');
            else
                albumArt.removeClass('buffering');

            bTime = new Date();
            bTime = bTime.getTime();

        },100);
    }

    function selectTrack(flag)
    {
        if( flag == 0 || flag == 1 )
            ++currIndex;
        else
            --currIndex;

        if( (currIndex > -1) && (currIndex < playedSongs.length) )
        {
            if( flag == 0 )
                i.attr('class','fa fa-play');
            else
            {
                albumArt.removeClass('buffering');
                i.attr('class','fa fa-pause');
            }

            seekBar.width(0);
            trackTime.removeClass('active');
            currTrackTime.text('00:00');
            durTrackTime.text('00:00');
			
			currAlbum = playedSongs[currIndex].name;
            currTrackName = playedSongs[currIndex].artist;
            currArtwork = playedSongs[currIndex].picture;

            audio.src = playedSongs[currIndex].url;
            
            nTime = 0;
            bTime = new Date();
            bTime = bTime.getTime();

            if(flag != 0)
            {
                audio.play();
                playerTrack.addClass('active');
                albumArt.addClass('active');
            
                clearInterval(buffInterval);
                checkBuffering();
            }

            albumName.text(currAlbum);
            trackName.text(currTrackName);
            $('#album-art img').prop('src', bgArtworkUrl);
        }
        else
        {
            if( flag == 0 || flag == 1 )
                --currIndex;
            else
                ++currIndex;
        }
    }

    function repeat()
    {   
        if( !isRepeatedOnce )
        {
            repeatButton.addClass('active');
            repeatButton.html('<i class="material-icons">repeat_one</i>');
            
            isRepeatedOnce = true;
        }
        else if( !isRepeatedAll )
        {
            repeatButton.html('<i class="material-icons">repeat</i>');
            
            isRepeatedOnce = false;
            isRepeatedAll = true;
        }
        else
        {
            repeatButton.removeClass('active');

            isRepeatedAll = false;
        }
    }

    function initPlayer()
	{	
        audio = new Audio();

		selectTrack(0);
		
		audio.loop = false;
		
		playPauseButton.on('click', playPause);
		
		progressBar.mousemove(function(event){ showHover(event); });
		
        progressBar.mouseout(hideHover);
        
        progressBar.on('click', playFromClickedPos);
		
        $(audio).on('timeupdate', updateCurrTime);

        playPreviousTrackButton.on('click', function(){ selectTrack(-1); });
        playNextTrackButton.on('click', function(){ selectTrack(1); });
        repeatButton.on('click', repeat);
	}
    
    playedSongs = shuffle();
    initPlayer();
    shuffleButton.on('click', function(){ playedSongs = shuffle(); });
});

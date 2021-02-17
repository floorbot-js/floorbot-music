# floorbot-music

The music component of floorbot

### Commands

```bash
/join (voice_channel)     # Joins a specific or command authors voice channel
                              # (voice_channel) A specific voice channel to join
/leave                    # Leaves the currently joined voice channel
/queue [url] (shuffle)    # Queue a song/playlist from a url
                              # [url] The media url to add to the queue
                              # (shuffle) decides if a queued playlist should be shuffled

### TODO ##
/next (url)               # The same as queue except the song(s) play next
/skip (count)             # Skip the current or next specified song count
/shuffle                  # Shuffle the playlist (excluding current song)
/list                     # Display the current song queue list
/volume (level)           # Set or reset the volume of the audio
/pause                    # Pause the current track
/resume                   # Resume the current track
/current                  # Display the current track
/clear                    # Clear the current queue
```

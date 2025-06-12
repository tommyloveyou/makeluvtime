"use client"

import { useState, useRef, useEffect } from "react"
import { Settings, Play, Share2, Copy, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import YouTubePlayer from "react-youtube"
import { useToast } from "@/hooks/use-toast"

// Predefined playlists (only you can edit these)
const SUGGESTED_ALBUMS = [
  {
    id: "romantic-classics",
    name: "Romantic Classics",
    videos: [
      { id: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE" },
      { id: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito ft. Daddy Yankee" },
      { id: "RgKAFK5djSk", title: "Wiz Khalifa - See You Again ft. Charlie Puth" },
    ],
  },
  {
    id: "intimate-vibes",
    name: "Intimate Vibes",
    videos: [
      { id: "fJ9rUzIMcZQ", title: "Queen - Bohemian Rhapsody" },
      { id: "SlPhMPnQ58k", title: "Adele - Someone Like You" },
      { id: "YQHsXMglC9A", title: "Adele - Hello" },
    ],
  },
  {
    id: "chill-moments",
    name: "Chill Moments",
    videos: [
      { id: "JGwWNGJdvx8", title: "Ed Sheeran - Shape of You" },
      { id: "nfs8NYg7yQM", title: "Maroon 5 - Sugar" },
      { id: "hLQl3WQQoQ0", title: "Adele - Someone Like You" },
    ],
  },
]

// Default playlist that starts automatically
const DEFAULT_PLAYLIST = SUGGESTED_ALBUMS[0].videos

export default function RomanticApp() {
  const [mood, setMood] = useState<"sexy" | "warm" | "chill">("sexy")
  const [showControls, setShowControls] = useState(false)
  const [showSharePopup, setShowSharePopup] = useState(false)
  const [youtubeLink, setYoutubeLink] = useState("")
  const [playlist, setPlaylist] = useState<Array<{ id: string; title: string }>>(DEFAULT_PLAYLIST)
  const [currentVideo, setCurrentVideo] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  // Extract YouTube ID from URL
  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Simulate fetching YouTube video title
  const fetchVideoTitle = async (videoId: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return `Video Title for ${videoId}`
  }

  // Add video to playlist with title fetching (max 10 songs)
  const addToPlaylist = async () => {
    if (playlist.length >= 10) {
      toast({
        title: "Playlist full",
        description: "Maximum 10 songs allowed in your playlist",
        variant: "destructive",
      })
      return
    }

    const id = extractYouTubeId(youtubeLink)
    if (id) {
      try {
        const title = await fetchVideoTitle(id)
        setPlaylist((prev) => [...prev, { id, title }])
        setYoutubeLink("")
        toast({
          title: "Song added",
          description: `"${title}" has been added to your playlist`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not fetch video information",
          variant: "destructive",
        })
      }
    }
  }

  // Load suggested album
  const loadSuggestedAlbum = (album: (typeof SUGGESTED_ALBUMS)[0]) => {
    setPlaylist(album.videos)
    setCurrentVideo(0)
    setIsPlaying(true)
    toast({
      title: "Album loaded",
      description: `Now playing "${album.name}"`,
    })
  }

  // Handle video end - play random next video
  const handleVideoEnd = () => {
    if (playlist.length > 0) {
      let nextIndex
      do {
        nextIndex = Math.floor(Math.random() * playlist.length)
      } while (nextIndex === currentVideo && playlist.length > 1)
      setCurrentVideo(nextIndex)
    }
  }

  // Copy share link to clipboard
  const copyShareLink = () => {
    navigator.clipboard.writeText("https://myplaylist.love/abc123")
    toast({
      title: "Link copied!",
      description: "Share this with your special someone",
    })
  }

  // Change background video when mood changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [mood])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Background Video */}
      <video ref={videoRef} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src={`/${mood}.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* YouTube Player - Small, Semi-transparent, Bottom-right */}
      {currentVideo !== null && isPlaying && (
        <div className="absolute bottom-4 right-4 z-10 w-48 h-28 md:w-80 md:h-45">
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm shadow-2xl">
            <YouTubePlayer
              videoId={playlist[currentVideo]?.id}
              opts={{
                height: "100%",
                width: "100%",
                playerVars: {
                  autoplay: 1,
                  controls: 1,
                  modestbranding: 1,
                },
              }}
              onEnd={handleVideoEnd}
              className="opacity-80"
            />
          </div>
        </div>
      )}

      {/* Settings Button - Top Right */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-4 right-4 z-50 p-2 md:p-3 rounded-full 
                   bg-black/30 backdrop-blur-md text-white 
                   hover:bg-black/40 transition-all duration-300
                   shadow-lg border border-white/10"
      >
        <Settings className="w-4 h-4 md:w-6 md:h-6" />
      </button>

      {/* Share Popup */}
      {showSharePopup && (
        <div className="absolute inset-0 flex items-center justify-center z-60 p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-medium">Share Your Love Playlist</h3>
              <button
                onClick={() => setShowSharePopup(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white/80 text-sm mb-4">
              Share your love playlist with a special link. It will be saved for 30 days.
            </p>
            <div className="bg-black/30 rounded-lg p-3 mb-4">
              <p className="text-white/60 text-xs mb-1">Your playlist link:</p>
              <p className="text-white text-sm font-mono break-all">https://myplaylist.love/abc123</p>
            </div>
            <Button
              onClick={copyShareLink}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      )}

      {/* Control Panel */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center z-20 p-4">
          <div
            className="bg-black/40 backdrop-blur-xl rounded-3xl p-4 md:p-8 w-full max-w-sm md:max-w-md 
                      shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 
                      transition-all duration-500 animate-fade-in max-h-[90vh] overflow-y-auto"
          >
            <h1 className="text-xl md:text-3xl font-light text-white text-center mb-4 md:mb-6">Romantic Moments</h1>

            {/* Mood Selection */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-white/80 text-sm mb-2 md:mb-3">Select Mood</h2>
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                <Button
                  onClick={() => setMood("sexy")}
                  variant={mood === "sexy" ? "default" : "outline"}
                  className={`text-xs md:text-sm py-2 md:py-3 rounded-xl ${
                    mood === "sexy"
                      ? "bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-500/25"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  }`}
                >
                  Sexy 💋
                </Button>
                <Button
                  onClick={() => setMood("warm")}
                  variant={mood === "warm" ? "default" : "outline"}
                  className={`text-xs md:text-sm py-2 md:py-3 rounded-xl ${
                    mood === "warm"
                      ? "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  }`}
                >
                  Warm 🔥
                </Button>
                <Button
                  onClick={() => setMood("chill")}
                  variant={mood === "chill" ? "default" : "outline"}
                  className={`text-xs md:text-sm py-2 md:py-3 rounded-xl ${
                    mood === "chill"
                      ? "bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/25"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  }`}
                >
                  Chill 🌈
                </Button>
              </div>
            </div>

            {/* Suggested Albums */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-white/80 text-sm mb-2 md:mb-3">Suggested Albums</h2>
              <div className="space-y-2">
                {SUGGESTED_ALBUMS.map((album) => (
                  <Button
                    key={album.id}
                    onClick={() => loadSuggestedAlbum(album)}
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs md:text-sm py-2 md:py-3 rounded-xl transition-all duration-300 hover:shadow-lg"
                    variant="outline"
                  >
                    <Play className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    {album.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Add Custom Music */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-white/80 text-sm mb-2 md:mb-3">Add Your Music ({playlist.length}/10 songs)</h2>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Paste YouTube link..."
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-xs md:text-sm rounded-xl"
                />
                <Button
                  onClick={addToPlaylist}
                  disabled={!extractYouTubeId(youtubeLink) || playlist.length >= 10}
                  className="whitespace-nowrap bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm px-3 md:px-4 rounded-xl"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Share Playlist Button */}
            <div className="mb-4 md:mb-6">
              <Button
                onClick={() => setShowSharePopup(true)}
                className="w-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-600/90 hover:to-pink-600/90 
                          text-white text-xs md:text-sm py-2 md:py-3 rounded-xl
                          shadow-lg shadow-purple-500/25 border border-white/20
                          transition-all duration-300 transform hover:scale-[1.02]"
              >
                <Share2 className="w-3 h-3 md:w-4 md:h-4 mr-2" />📤 Share this playlist (save for 30 days)
              </Button>
            </div>

            {/* Current Playlist */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-white/80 text-sm mb-2 md:mb-3">Current Playlist ({playlist.length} songs)</h2>
              <div className="bg-black/30 rounded-xl p-2 max-h-32 md:max-h-40 overflow-y-auto border border-white/10">
                {playlist.length === 0 ? (
                  <p className="text-white/50 text-center py-4 text-xs md:text-sm">No songs in playlist</p>
                ) : (
                  <ul className="space-y-1">
                    {playlist.map((video, index) => (
                      <li
                        key={index}
                        className={`text-white flex items-center gap-2 p-2 rounded-lg text-xs md:text-sm transition-all ${
                          index === currentVideo
                            ? "bg-gradient-to-r from-pink-500/30 to-rose-500/30 shadow-lg"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full text-xs ${
                            index === currentVideo ? "bg-pink-500 text-white shadow-lg" : "bg-white/20"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="truncate flex-1">{video.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setShowControls(false)}
              className="w-full py-3 md:py-4 text-sm md:text-lg bg-gradient-to-r from-pink-500/80 to-rose-500/80 hover:from-pink-600/80 hover:to-rose-600/80 text-white backdrop-blur-sm rounded-xl shadow-lg"
            >
              Close Controls
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

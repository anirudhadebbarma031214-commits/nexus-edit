import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Aperture, AudioLines, Bell, ChevronDown, CircleHelp, Clapperboard, Clock3,
  Command, Crop, Download, Film, FolderOpen, Gauge, Grid2X2, Layers3, Maximize2,
  Minus, Monitor, MoreHorizontal, MousePointer2, Music2, Play, Plus, Scissors,
  Settings2, SkipBack, SkipForward, Sparkles, Square, Volume2, WandSparkles,
  X, ZoomIn, ZoomOut
} from 'lucide-react';

const initialTracks = [
  { id: 'video', name: 'VIDEO 01', icon: Film, color: 'blue' },
  { id: 'overlay', name: 'OVERLAY', icon: Layers3, color: 'purple' },
  { id: 'audio', name: 'AUDIO 01', icon: AudioLines, color: 'green' }
];

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function App() {
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [activeTab, setActiveTab] = useState('Media');
  const [playhead, setPlayhead] = useState(4);
  const [duration, setDuration] = useState(42);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedClip, setSelectedClip] = useState('clip-1');
  const [projectName, setProjectName] = useState('Untitled Project');
  const [renaming, setRenaming] = useState(false);
  const [showInspector, setShowInspector] = useState(true);
  const [toast, setToast] = useState('');
  const videoRef = useRef(null);
  const timelineRef = useRef(null);

  const videoMedia = useMemo(() => media.find(item => /^(mp4|mov|mkv|webm|avi|m4v)$/i.test(item.type)), [media]);

  useEffect(() => {
    if (videoMedia && !selectedMedia) setSelectedMedia(videoMedia);
  }, [videoMedia, selectedMedia]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setPlayhead(value => value >= duration ? 0 : value + 0.25), 250);
    return () => clearInterval(timer);
  }, [playing, duration]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.code === 'Space') { event.preventDefault(); setPlaying(v => !v); }
      if (event.key === 'ArrowLeft') setPlayhead(v => Math.max(0, v - (event.shiftKey ? 5 : 1)));
      if (event.key === 'ArrowRight') setPlayhead(v => Math.min(duration, v + (event.shiftKey ? 5 : 1)));
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') { event.preventDefault(); importFiles(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 2600);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function importFiles() {
    if (!window.nexus?.importMedia) {
      setToast('Run this project with npm run dev to import local files.');
      return;
    }
    try {
      const files = await window.nexus.importMedia();
      if (!files.length) return;
      setMedia(current => [...current, ...files]);
      setSelectedMedia(files.find(f => /^(mp4|mov|mkv|webm|avi|m4v)$/i.test(f.type)) || files[0]);
      setToast(`Imported ${files.length} file${files.length === 1 ? '' : 's'}`);
    } catch {
      setToast('Could not import media. Please try again.');
    }
  }

  function addToTimeline(item = selectedMedia) {
    if (!item) { setToast('Import media first to add a timeline clip.'); return; }
    const id = `clip-${Date.now()}`;
    setMedia(current => current.map(m => m.path === item.path ? { ...m, used: true } : m));
    setSelectedClip(id);
    setDuration(current => Math.max(current, 42));
    setToast(`${item.name} added to timeline`);
  }

  function togglePlay() {
    setPlaying(value => !value);
    if (videoRef.current) {
      if (playing) videoRef.current.pause();
      else videoRef.current.play().catch(() => {});
    }
  }

  const rulerMarks = Array.from({ length: 13 }, (_, i) => i * 5);

  return (
    <div className="app-shell">
      <header className="titlebar">
        <div className="brand"><div className="brand-mark"><Aperture size={18} /></div><span>NEXUS <b>EDIT</b></span><span className="version">BETA</span></div>
        <div className="project-title">
          {renaming ? <input autoFocus value={projectName} onChange={e => setProjectName(e.target.value)} onBlur={() => setRenaming(false)} onKeyDown={e => e.key === 'Enter' && setRenaming(false)} /> : <button className="project-name" onClick={() => setRenaming(true)}>{projectName}<ChevronDown size={13} /></button>}
          <span className="saved-dot" /> <span className="saved-text">Local project</span>
        </div>
        <div className="title-actions"><button className="icon-btn" title="Help" onClick={() => setToast('Shortcuts: Space play/pause · ←/→ frame step · Ctrl+I import')}><CircleHelp size={16}/></button><button className="icon-btn" title="Minimize" onClick={() => window.nexus?.minimize()}><Minus size={16}/></button><button className="icon-btn" title="Maximize" onClick={() => window.nexus?.toggleMaximize()}><Maximize2 size={14}/></button><button className="icon-btn close-btn" title="Close" onClick={() => window.nexus?.close()}><X size={16}/></button></div>
      </header>

      <nav className="main-nav">
        <div className="nav-tabs">
          {['Media', 'Edit', 'Effects', 'Titles', 'Audio', 'Color'].map((tab, i) => <button key={tab} className={activeTab === tab ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveTab(tab)}>{[<FolderOpen size={15}/>,<Scissors size={15}/>,<Sparkles size={15}/>,<Clapperboard size={15}/>,<Music2 size={15}/>,<Aperture size={15}/>][i]}{tab}</button>)}
        </div>
        <div className="nav-right"><span className="resolution"><Monitor size={14}/> Preview · Fit</span><button className="export-btn" onClick={() => setToast('Export pipeline is not enabled in this starter yet.')}><Download size={15}/> Export</button></div>
      </nav>

      <main className={showInspector ? 'workspace' : 'workspace no-inspector'}>
        <aside className="media-panel panel">
          <div className="panel-heading"><div><span className="eyebrow">PROJECT</span><h2>Media library <span className="count">{media.length}</span></h2></div><button className="icon-btn small" title="More options" onClick={() => setToast('Media library options coming soon.')}><MoreHorizontal size={17}/></button></div>
          <div className="media-toolbar"><button className="subtle-btn" onClick={importFiles}><Plus size={14}/> Import</button><button className="icon-btn small" title="Grid view"><Grid2X2 size={15}/></button><button className="icon-btn small" title="Media settings" onClick={() => setToast('Media settings coming soon.')}><Settings2 size={15}/></button></div>
          <div className="media-search"><span>⌕</span><input placeholder="Search media..." onChange={e => { const q = e.target.value.toLowerCase(); document.querySelectorAll('[data-media-name]').forEach(el => { el.style.display = el.dataset.mediaName.includes(q) ? '' : 'none'; }); }}/><span className="shortcut">⌘ F</span></div>
          <div className="media-content">
            {media.length === 0 ? <div className="empty-media"><div className="empty-icon"><FolderOpen size={25}/></div><h3>Your story starts here</h3><p>Import video, audio and images to start building your edit.</p><button className="primary-btn" onClick={importFiles}><Plus size={15}/> Import media</button><span className="hint">or drag files into this panel</span></div> :
              <div className="media-grid">{media.map((item, i) => <button key={item.path + i} data-media-name={item.name.toLowerCase()} className={selectedMedia?.path === item.path ? 'media-card selected' : 'media-card'} onClick={() => setSelectedMedia(item)} onDoubleClick={() => addToTimeline(item)}><div className={'media-thumb ' + (item.type.match(/mp3|wav|aac|m4a/) ? 'audio-thumb' : '')}>{item.type.match(/mp3|wav|aac|m4a/) ? <AudioLines size={24}/> : item.type.match(/png|jpg|jpeg|webp/) ? <Aperture size={24}/> : <Film size={24}/>}<span className="media-type">{item.type || 'FILE'}</span></div><span className="media-name">{item.name}</span></button>)}</div>}
          </div>
          <div className="panel-footer"><span><span className="status-dot"/> All changes local</span><span>{media.length} assets</span></div>
        </aside>

        <section className="center-stage">
          <div className="preview-panel panel">
            <div className="panel-heading preview-heading"><div><span className="eyebrow">CANVAS</span><h2>Preview <span className="live-tag">LIVE</span></h2></div><div className="preview-tools"><button className="icon-btn small" title="Crop" onClick={() => setToast('Crop tool coming soon.')}><Crop size={15}/></button><button className="icon-btn small" title="Preview size" onClick={() => setToast('Preview is set to Fit.')}><Maximize2 size={14}/></button><button className="icon-btn small" title="More"><MoreHorizontal size={17}/></button></div></div>
            <div className="preview-canvas">
              <div className="canvas-corner top-left"/><div className="canvas-corner top-right"/><div className="canvas-corner bottom-left"/><div className="canvas-corner bottom-right"/>
              {selectedMedia && /^(mp4|mov|mkv|webm|avi|m4v)$/i.test(selectedMedia.type) ? <video ref={videoRef} className="video-preview" src={selectedMedia.url} onTimeUpdate={e => setPlayhead(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(e.currentTarget.duration || 42)} /> :
                <div className="canvas-placeholder"><div className="placeholder-logo"><Aperture size={42}/></div><div className="placeholder-title">NEXUS <b>EDIT</b></div><p>{selectedMedia ? selectedMedia.name : 'Your creative timeline begins here.'}</p><span className="placeholder-sub">IMPORT MEDIA TO PREVIEW YOUR FOOTAGE</span></div>}
              <div className="canvas-overlay"><span>3840 × 2160</span><span>00:00:{String(Math.floor(playhead)).padStart(2,'0')}:00</span></div>
            </div>
            <div className="transport">
              <div className="transport-left"><button className="icon-btn" title="Volume" onClick={() => setToast('Audio monitoring volume: 100%')}><Volume2 size={16}/></button><span className="time-readout">{formatTime(playhead)}<i> / </i>{formatTime(duration)}</span></div>
              <div className="transport-controls"><button className="transport-btn" title="Previous" onClick={() => setPlayhead(0)}><SkipBack size={17}/></button><button className="play-btn" title="Play / Pause (Space)" onClick={togglePlay}>{playing ? <Square size={15} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}</button><button className="transport-btn" title="Next" onClick={() => setPlayhead(Math.min(duration, playhead + 5))}><SkipForward size={17}/></button></div>
              <div className="transport-right"><button className="icon-btn" title="Zoom out" onClick={() => setZoom(v => Math.max(.5, v - .1))}><ZoomOut size={15}/></button><div className="zoom-track"><div style={{width: ((zoom - .5) / 1.5 * 100) + '%'}}/></div><button className="icon-btn" title="Zoom in" onClick={() => setZoom(v => Math.min(2, v + .1))}><ZoomIn size={15}/></button></div>
            </div>
          </div>
          <section className="timeline-panel panel" ref={timelineRef}>
            <div className="timeline-top"><div className="timeline-title"><span className="eyebrow">SEQUENCE</span><h2>Timeline</h2><span className="timeline-badge">01</span></div><div className="timeline-actions"><button className="subtle-btn" onClick={() => addToTimeline()}><Plus size={14}/> Add clip</button><button className="icon-btn small" title="Split clip" onClick={() => setToast('Select a clip to split.')}><Scissors size={15}/></button><button className="icon-btn small" title="Timeline settings"><Settings2 size={15}/></button></div></div>
            <div className="timeline-body">
              <div className="track-labels"><div className="ruler-label"><Clock3 size={13}/></div>{initialTracks.map(track => <div className="track-label" key={track.id}><track.icon size={14}/><span>{track.name}</span><button onClick={() => setToast(track.name + ' track options coming soon.')}><MoreHorizontal size={13}/></button></div>)}</div>
              <div className="timeline-scroll">
                <div className="timeline-ruler" style={{minWidth: `${720 * zoom}px`}}>{rulerMarks.map(mark => <div className="ruler-tick" key={mark} style={{left: `${mark * 2.1 * zoom}%`}}><span>{formatTime(mark)}</span><i/></div>)}</div>
                <div className="tracks-area" style={{minWidth: `${720 * zoom}px`}} onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setPlayhead(Math.max(0, Math.min(duration, ((e.clientX - rect.left) / rect.width) * duration))); }}>
                  <div className="playhead" style={{left: `${(playhead / duration) * 100}%`}}><div className="playhead-cap"/></div>
                  <div className="track-lane">{media.filter(m => m.used).map((item, i) => <button key={item.path} className={'clip video-clip ' + (selectedClip === item.path ? 'clip-selected' : '')} style={{left: `${i * 22}%`, width: `${Math.max(18, Math.min(45, item.name.length * 1.1))}%`}} onClick={e => { e.stopPropagation(); setSelectedClip(item.path); setSelectedMedia(item); }}><div className="clip-wave"><span/>{Array.from({length:28},(_,j)=><i key={j} style={{height: `${18 + ((j*13+i*7)%70)}%`}}/>)}<span/></div><span className="clip-name">{item.name}</span></button>)}</div>
                  <div className="track-lane"><div className="lane-placeholder"><Plus size={12}/> Drop overlay here</div></div>
                  <div className="track-lane"><div className="audio-placeholder">{Array.from({length:70},(_,j)=><i key={j} style={{height: `${12 + ((j*19)%75)}%`}}/>)}</div></div>
                </div>
              </div>
            </div>
            <div className="timeline-bottom"><span>00:00:00:00</span><span>25 FPS <i>·</i> UHD</span><span>Magnet snapping <b className="toggle-on">ON</b></span></div>
          </section>
        </section>

        {showInspector && <aside className="inspector-panel panel">
          <div className="panel-heading"><div><span className="eyebrow">CONTROLS</span><h2>Inspector</h2></div><button className="icon-btn small" title="Close inspector" onClick={() => setShowInspector(false)}><X size={15}/></button></div>
          <div className="inspector-tabs"><button className="active">Transform</button><button onClick={() => setToast('Color controls coming soon.')}>Color</button><button onClick={() => setToast('Audio controls coming soon.')}>Audio</button></div>
          <div className="inspector-content">
            <div className="inspector-section"><div className="section-title"><span>TRANSFORM</span><button className="icon-btn tiny" onClick={() => setToast('Transform reset.')}><Gauge size={13}/></button></div>
              {[['Position X','0'],['Position Y','0'],['Scale','100'],['Rotation','0°']].map(([label,val])=><div className="property-row" key={label}><label>{label}</label><div className="property-input"><input defaultValue={val}/>{label==='Scale' && <span>%</span>}</div></div>)}
              <div className="property-row"><label>Anchor point</label><div className="anchor-grid"><span/><span/><span/><span/><span className="anchor-active"/><span/><span/><span/><span/></div></div>
              <div className="property-row"><label>Opacity</label><div className="slider-property"><div className="mini-slider"><span/></div><b>100%</b></div></div>
            </div>
            <div className="inspector-section"><div className="section-title"><span>BLENDING</span><ChevronDown size={14}/></div><div className="property-row"><label>Blend mode</label><button className="dropdown-field" onClick={() => setToast('Normal blend mode selected.')}>Normal <ChevronDown size={13}/></button></div></div>
            <div className="inspector-section"><div className="section-title"><span>CLIP INFO</span><Film size={13}/></div><div className="clip-info"><div className="info-icon"><Film size={18}/></div><div><b>{selectedMedia?.name || 'No clip selected'}</b><span>{selectedMedia ? (selectedMedia.type.toUpperCase() + ' · Imported media') : 'Select a clip on the timeline'}</span></div></div><button className="full-subtle" onClick={() => setToast('Clip properties are read-only in this starter.')}>View properties <ChevronDown size={13}/></button></div>
            <div className="inspector-tip"><WandSparkles size={16}/><div><b>Make it yours</b><p>Select media and add it to the timeline to begin shaping your edit.</p></div></div>
          </div>
          <div className="panel-footer"><span>Inspector</span><button className="icon-btn tiny" onClick={() => setShowInspector(false)}><ChevronDown size={13}/></button></div>
        </aside>}
      </main>

      <footer className="statusbar"><div><span className="status-dot"/> Ready</div><div className="status-center"><span><Command size={12}/> K</span> Quick actions <span className="status-separator">|</span> Space to play/pause</div><div className="status-right"><span>GPU preview</span><span className="gpu-dot"/><button onClick={() => setShowInspector(v => !v)}>{showInspector ? 'Hide' : 'Show'} inspector</button></div></footer>
      {toast && <div className="toast"><span className="toast-mark"><Sparkles size={15}/></span>{toast}<button onClick={() => setToast('')}><X size={13}/></button></div>}
    </div>
  );
}
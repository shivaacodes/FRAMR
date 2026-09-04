import { useState, useRef, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // null, 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
  const [logs, setLogs] = useState([]);
  const [videoId, setVideoId] = useState(null);
  const [highlightUrl, setHighlightUrl] = useState(null);
  const fileInputRef = useRef(null);

  const addLog = (msg) => setLogs(prev => [...prev, `> ${msg}`]);

  const handleUpload = async (file) => {
    if (!file) return;
    
    setIsProcessing(true);
    setStatus('UPLOADING');
    setLogs([]);
    addLog(`INITIATING SEQUENCE FOR: ${file.name}`);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      addLog('UPLOADING TO MAINFRAME...');
      const res = await fetch(`${API_BASE}/api/v1/videos/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.video_id) {
        setVideoId(data.video_id);
        setStatus('PROCESSING');
        addLog(`UPLOAD COMPLETE. ID: 0x${data.video_id.toString(16).toUpperCase()}`);
        addLog('PARSING VIDEO STREAM & DETECTING MOTION VECTORS...');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('FAILED');
      addLog('ERR: UPLOAD FAILED.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  // Poll for status
  useEffect(() => {
    let interval;
    if (videoId && (status === 'PENDING' || status === 'PROCESSING')) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/v1/videos/${videoId}`);
          const data = await res.json();
          
          if (data.status === 'COMPLETED') {
            setStatus('COMPLETED');
            setHighlightUrl(`${API_BASE}/highlights/${data.highlight_path}`);
            addLog(`HIGHLIGHT EXTRACTED SUCCESSFULLY!`);
            clearInterval(interval);
          } else if (data.status === 'FAILED') {
            setStatus('FAILED');
            addLog('ERR: PROCESSING FAILED.');
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 2000); // poll every 2 seconds
    }
    return () => clearInterval(interval);
  }, [videoId, status]);

  return (
    <>
      <div className="noise-overlay"></div>
      
      <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto flex flex-col gap-12 relative z-10">
        
        {/* Header */}
        <header className="flex justify-between items-end border-b-8 border-framr-black pb-4">
          <div>
            <h1 className="font-display font-black text-6xl md:text-8xl tracking-tighter leading-none flex items-center gap-2">
              <span className="bg-framr-magenta text-white px-2 uppercase">F</span>
              RAMR
            </h1>
            <p className="font-mono text-sm md:text-base font-bold mt-2 bg-framr-lime inline-block px-2 border-2 border-framr-black">
              AUTOMATED HIGHLIGHT GENERATOR v1.0
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-framr-yellow border-4 border-framr-black shadow-brutal flex items-center justify-center font-display font-black text-3xl">
              *
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Upload */}
          <section className="flex flex-col gap-6">
            <h2 className="font-display font-black text-3xl uppercase bg-framr-black text-white inline-block px-4 py-1 self-start">
              FEED THE ALGORITHM
            </h2>
            
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`border-8 border-framr-black p-12 flex flex-col items-center justify-center text-center cursor-pointer shadow-brutal transition-all min-h-[300px] relative overflow-hidden ${isProcessing ? 'bg-framr-cream opacity-50 pointer-events-none' : 'bg-framr-lime hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(9,9,9,1)]'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="video/*" 
                className="hidden" 
              />
              
              <div className="absolute top-2 left-2 w-4 h-4 bg-framr-black"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-framr-black"></div>
              
              <div className="font-display font-black text-5xl md:text-6xl mb-4">
                DROP TAPE
              </div>
              <p className="font-mono font-bold text-lg bg-framr-cream border-2 border-framr-black px-4 py-1">
                MP4 / MOV / AVI
              </p>
              
              {!isProcessing && (
                <div className="mt-8">
                  <span className="btn-brutal bg-framr-magenta text-white px-8 py-3 text-xl inline-block hover:bg-framr-yellow hover:text-framr-black">
                    BROWSE FILES
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Right Column: Processing / Output */}
          <section className="flex flex-col gap-6 h-full">
            <h2 className="font-display font-black text-3xl uppercase bg-framr-black text-white inline-block px-4 py-1 self-start">
              OUTPUT FEED
            </h2>
            
            <div className="bg-framr-black border-4 border-framr-black h-full min-h-[300px] flex flex-col relative text-framr-cream overflow-hidden">
              
              {/* Video Player or Processing State */}
              <div className="flex-grow flex items-center justify-center relative p-6">
                
                {!isProcessing ? (
                  <div className="text-center opacity-50">
                    <div className="font-display font-bold text-4xl mb-2">NO SIGNAL</div>
                    <div className="font-mono text-sm">AWAITING INPUT SOURCE...</div>
                  </div>
                ) : status === 'COMPLETED' ? (
                  <video 
                    src={highlightUrl} 
                    controls 
                    autoPlay
                    className="w-full h-full max-h-[350px] object-cover border-4 border-framr-magenta shadow-[0_0_15px_rgba(255,0,255,0.5)]"
                  />
                ) : (
                  <div className="w-full flex flex-col h-full justify-center">
                    {/* Fake Loading State */}
                    <div className="flex justify-between font-mono text-framr-lime font-bold mb-2 uppercase text-sm">
                      <span>Status: {status}</span>
                      <span className="animate-pulse">_</span>
                    </div>
                    
                    <div className="w-full h-8 border-4 border-framr-cream bg-transparent relative overflow-hidden mb-6">
                      <div className="absolute top-0 left-0 h-full bg-framr-magenta w-[100%] animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI4IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMykiPjwvcmVjdD4KPC9zdmc+')] opacity-30"></div>
                    </div>
                    
                    {/* Log Terminal */}
                    <div className="border-t-2 border-dashed border-gray-700 pt-4 font-mono text-xs text-gray-400 h-32 overflow-y-auto flex flex-col gap-1">
                      {logs.map((log, i) => (
                        <p key={i} className={i === logs.length - 1 ? 'text-framr-yellow' : ''}>{log}</p>
                      ))}
                      {status === 'PROCESSING' && <p className="animate-pulse text-framr-lime">_</p>}
                    </div>
                  </div>
                )}
                
              </div>
            </div>
            
          </section>

        </main>
      </div>
    </>
  );
}

export default App;

import React, { useRef, useState, Suspense, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { io } from 'socket.io-client';
import API_CONFIG from '../../config/api.js';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, X, Upload, Maximize } from "lucide-react";

// --- Sub-Components ---

// Whiteboard Texture Component (The 3D view)
const WhiteboardTexture = ({ imageUrl }) => {
  const texture = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (imageUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(
        imageUrl,
        (loadedTexture) => {
          texture.current = loadedTexture;
          setIsLoaded(true);
        },
        undefined,
        (error) => console.error('Error loading whiteboard texture:', error)
      );
    }
  }, [imageUrl]);

  if (!isLoaded || !texture.current) return null;

  return (
    <mesh position={[0, 0, 0.07]}>
      <planeGeometry args={[11.5, 5.5]} />
      <meshBasicMaterial map={texture.current} />
    </mesh>
  );
};

// 3D Whiteboard Object
const Whiteboard = ({ imageUrl, onOpenModal }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[0, 4, -8]}>
      {/* Frame */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 6, 0.1]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>

      {/* Surface - Click to open Modal */}
      <mesh
        position={[0, 0, 0.06]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onOpenModal();
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          setHovered(false);
        }}
      >
        <planeGeometry args={[11.5, 5.5]} />
        <meshStandardMaterial
          color={hovered ? "#ffffee" : "#ffffff"}
          roughness={0.9}
        />
      </mesh>

      {/* Image Texture */}
      {imageUrl && <WhiteboardTexture imageUrl={imageUrl} />}
      
      {/* Hover Text Hint */}
      {hovered && (
        <Text position={[0, 0, 0.2]} fontSize={0.5} color="#333">
          Click to Open
        </Text>
      )}
    </group>
  );
};

const Floor = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
    <planeGeometry args={[100, 100]} />
    <meshStandardMaterial color="#e8eaf6" roughness={0.8} />
  </mesh>
);

const ElongatedTable = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
      <boxGeometry args={[16, 0.15, 3]} />
      <meshStandardMaterial color="#5d4037" roughness={0.3} />
    </mesh>
    {[
       [-7, 0.375, 1.2], [-7, 0.375, -1.2],
       [-2.5, 0.375, 1.2], [-2.5, 0.375, -1.2],
       [2.5, 0.375, 1.2], [2.5, 0.375, -1.2],
       [7, 0.375, 1.2], [7, 0.375, -1.2]
    ].map((pos, i) => (
      <mesh key={i} position={pos} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.75]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>
    ))}
  </group>
);

const BigSofa = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
      <boxGeometry args={[5, 0.6, 2]} />
      <meshStandardMaterial color="#1565c0" roughness={0.8} />
    </mesh>
    <mesh position={[0, 1.1, -0.8]} castShadow receiveShadow>
      <boxGeometry args={[5, 1.4, 0.4]} />
      <meshStandardMaterial color="#1976d2" roughness={0.8} />
    </mesh>
    <mesh position={[-2.3, 0.7, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.4, 1, 2]} />
      <meshStandardMaterial color="#1976d2" roughness={0.8} />
    </mesh>
    <mesh position={[2.3, 0.7, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.4, 1, 2]} />
      <meshStandardMaterial color="#1976d2" roughness={0.8} />
    </mesh>
  </group>
);

// Realistic Person Avatar
const PersonAvatar = ({ position, name, color = "#ffb74d", isSpeaking = false, isMe = false }) => {
  const meshRef = useRef();
  
  // Smooth position interpolation
  useFrame((state) => {
    if (meshRef.current) {
      // Breathing animation
      const breathing = isSpeaking ? 0.05 : 0.02;
      const breatheY = Math.sin(state.clock.elapsedTime * 8) * breathing;
      
      // Lerp (Linear Interpolation) for smooth movement if position changes abruptly
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, position[0], 0.1);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, position[2], 0.1);
      // Keep Y relative to breathing + floor height
      meshRef.current.position.y = position[1] + breatheY;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Indicator for "Me" */}
      {isMe && (
        <mesh position={[0, 2.2, 0]}>
           <coneGeometry args={[0.1, 0.2, 4]} />
           <meshBasicMaterial color="yellow" />
        </mesh>
      )}

      {/* Body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.5]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.7}
          emissive={isSpeaking ? color : "#000000"}
          emissiveIntensity={isSpeaking ? 0.4 : 0}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#ffe0b2" roughness={0.6} />
      </mesh>

      {/* Name label */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color={isSpeaking ? "#1976d2" : (isMe ? "#00aa00" : "#1e293b")}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {isMe ? "You" : name}
      </Text>
    </group>
  );
};

// Main Scene
const ClassroomScene = ({ 
  myPosition, 
  otherUsers, // Array of user objects
  userPositions, // Map of socketId -> [x,y,z]
  speakingUsers, 
  whiteboardImage, 
  onOpenWhiteboard,
  username 
}) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      <Floor />
      <ElongatedTable position={[0, 0, 0]} />
      <BigSofa position={[0, 0, 9]} rotation={[0, Math.PI, 0]} />

      {/* Render Myself */}
      <PersonAvatar 
        position={myPosition} 
        name={username} 
        color="#4caf50" // Green for self
        isSpeaking={speakingUsers.includes(username)}
        isMe={true}
      />

      {/* Render Other Connected Users */}
      {otherUsers.map((user) => {
        // If we have a live position from socket, use it. Otherwise default to waiting area.
        const pos = userPositions[user.socketId] || [-5, 0.75, 8]; 
        // Generate a stable color based on name length/char code
        const colorList = ["#ef5350", "#42a5f5", "#ab47bc", "#ffa726", "#26c6da", "#ec407a"];
        const colorIndex = user.username.length % colorList.length;
        
        return (
          <PersonAvatar
            key={user.socketId}
            position={pos}
            name={user.username}
            color={colorList[colorIndex]}
            isSpeaking={speakingUsers.includes(user.username)}
          />
        );
      })}

      <Whiteboard imageUrl={whiteboardImage} onOpenModal={onOpenWhiteboard} />
    </>
  );
};

// --- Main Application ---

export default function VRClassroom() {
  // Connection State
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [backendUrl, setBackendUrl] = useState(API_CONFIG.getCustomBackendUrl() || API_CONFIG.getCurrentBackendUrl());
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  // Classroom State
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [speakingUsers, setSpeakingUsers] = useState([]);
  const [whiteboardImage, setWhiteboardImage] = useState(null);
  const [showWhiteboardModal, setShowWhiteboardModal] = useState(false); // New Modal State
  
  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const chatMessagesEndRef = useRef(null);

  // Audio Refs
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioContextsRef = useRef({});
  const gainNodesRef = useRef({});

  // Movement State
  const [myPosition, setMyPosition] = useState([0, 0.75, 4]); // Start slightly back
  const [otherUserPositions, setOtherUserPositions] = useState({}); // Map socketId -> [x,y,z]
  const keysPressed = useRef({});

  // 1. Socket Setup
  useEffect(() => {
    if (!username || showUsernameModal) return;

    const currentBackendUrl = backendUrl || API_CONFIG.getCurrentBackendUrl();
    const baseUrl = currentBackendUrl.replace(/\/+$/, '').replace(/\/vr$/, '');
    const socketUrl = `${baseUrl}/vr`;

    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setError('');
      socketInstance.emit('join', { username: username.trim() });
    });

    socketInstance.on('disconnect', () => setIsConnected(false));
    
    // User Management
    socketInstance.on('usersList', (data) => setConnectedUsers(data.users));
    socketInstance.on('userJoined', (data) => {
      setConnectedUsers(prev => [...prev, { username: data.username, socketId: data.socketId }]);
    });
    socketInstance.on('userLeft', (data) => {
      setConnectedUsers(prev => prev.filter(u => u.socketId !== data.socketId));
      // Cleanup audio
      if (audioContextsRef.current[data.socketId]) {
        audioContextsRef.current[data.socketId].close();
        delete audioContextsRef.current[data.socketId];
      }
    });

    // Movement Listener (Receiving other players moving)
    socketInstance.on('playerMoved', (data) => {
      // data = { socketId, position: [x, y, z] }
      setOtherUserPositions(prev => ({
        ...prev,
        [data.socketId]: data.position
      }));
    });

    // Audio & Chat events
    socketInstance.on('voice', handleIncomingVoice);
    socketInstance.on('userVoiceStart', (data) => {
        setSpeakingUsers(prev => [...prev, data.username]);
        // Auto remove visual indicator after silence (fallback)
        setTimeout(() => setSpeakingUsers(prev => prev.filter(u => u !== data.username)), 2000);
    });
    socketInstance.on('userVoiceEnd', (data) => {
        setSpeakingUsers(prev => prev.filter(u => u !== data.username));
    });

    socketInstance.on('whiteboardUpdate', (data) => {
      if (data.imageUrl) setWhiteboardImage(data.imageUrl);
    });
    
    socketInstance.on('chatMessage', (data) => {
      setChatMessages(prev => [...prev, data]);
      setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      stopVoiceCapture();
    };
    // eslint-disable-next-line
  }, [username, showUsernameModal]);


  // 2. Movement Logic (WASD / Arrows)
  useEffect(() => {
    const handleKeyDown = (e) => { keysPressed.current[e.code] = true; };
    const handleKeyUp = (e) => { keysPressed.current[e.code] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game Loop for movement
    const moveInterval = setInterval(() => {
        if (showUsernameModal || showWhiteboardModal) return; // Don't move if modals open

        let dx = 0;
        let dz = 0;
        const speed = 0.15;

        if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) dz -= speed;
        if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) dz += speed;
        if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) dx -= speed;
        if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) dx += speed;

        if (dx !== 0 || dz !== 0) {
            setMyPosition(prev => {
                const newPos = [prev[0] + dx, prev[1], prev[2] + dz];
                // Boundary check (simple room bounds)
                if(newPos[0] > 10) newPos[0] = 10;
                if(newPos[0] < -10) newPos[0] = -10;
                if(newPos[2] > 12) newPos[2] = 12;
                if(newPos[2] < -8) newPos[2] = -8;
                
                // Emit movement to server
                if(socket) {
                    socket.emit('playerMove', { position: newPos });
                }
                return newPos;
            });
        }
    }, 30); // ~30fps update

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        clearInterval(moveInterval);
    };
  }, [socket, showUsernameModal, showWhiteboardModal]);


  // 3. Audio Logic
  const handleIncomingVoice = (data) => {
    try {
      if (!data.audioData) return;
      
      // Initialize AudioContext for specific user if needed
      if (!audioContextsRef.current[data.socketId]) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextsRef.current[data.socketId] = ctx;
      }
      
      const audioContext = audioContextsRef.current[data.socketId];
      if (audioContext.state === 'suspended') audioContext.resume();

      // Decode
      const binaryString = atob(data.audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const int16Data = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) float32Data[i] = int16Data[i] / 32768.0;

      const buffer = audioContext.createBuffer(1, float32Data.length, 44100);
      buffer.copyToChannel(float32Data, 0);

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();

    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const startVoiceCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      mediaStreamRef.current = stream;
      setIsRecording(true);

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!socket || isMuted || !isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        // Send base64
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(int16Data.buffer)));
        socket.emit('voice', { audioData: base64Audio });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      socket.emit('voiceStart');
    } catch (err) {
      setError("Mic access denied");
    }
  };

  const stopVoiceCapture = () => {
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    setIsRecording(false);
    socket?.emit('voiceEnd');
  };

  // 4. Whiteboard Handlers
  const fileInputRef = useRef(null);
  
  const handleWhiteboardUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && socket) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = ev.target.result;
        setWhiteboardImage(img);
        socket.emit('whiteboardImage', { imageUrl: img, username });
      };
      reader.readAsDataURL(file);
    }
  };

  // UI Handlers
  const handleJoin = () => {
    if (username.trim()) setShowUsernameModal(false);
    else setError("Username required");
  };

  const handleSendChatMessage = () => {
    if (chatInput.trim() && socket) {
        socket.emit('chatMessage', { message: chatInput.trim(), username });
        setChatInput('');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#e3f2fd', overflow: 'hidden' }}>
      
      {/* 1. LOGIN MODAL */}
      {showUsernameModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '400px' }}>
            <h2>Enter VR Classroom</h2>
            <input 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border:'1px solid #ccc' }} 
              placeholder="Your Name" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
             <input 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border:'1px solid #ccc', fontSize:'12px' }} 
              placeholder="Backend URL (Optional)" 
              value={backendUrl} 
              onChange={e => setBackendUrl(e.target.value)} 
            />
            {error && <p style={{color:'red'}}>{error}</p>}
            <button 
              onClick={handleJoin}
              style={{ width: '100%', padding: '12px', background: 'black', color:'white', borderRadius:'8px', cursor:'pointer' }}
            >
              Join
            </button>
          </div>
        </div>
      )}

      {/* 2. 3D CANVAS */}
      <Canvas shadows camera={{ position: [0, 8, 18], fov: 60 }}>
        <Suspense fallback={null}>
          <ClassroomScene 
            myPosition={myPosition}
            otherUsers={connectedUsers.filter(u => u.username !== username)}
            userPositions={otherUserPositions}
            speakingUsers={speakingUsers}
            whiteboardImage={whiteboardImage}
            onOpenWhiteboard={() => setShowWhiteboardModal(true)}
            username={username}
          />
        </Suspense>
        {/* Orbit Controls mostly for looking around, disable pan so keys handle movement */}
        <OrbitControls enablePan={true} maxPolarAngle={Math.PI / 2.1} />
        <fog attach="fog" args={['#e3f2fd', 20, 60]} />
      </Canvas>

      {/* 3. WHITEBOARD MODAL (2D Overlay) */}
      {showWhiteboardModal && (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: '90%', height: '85%', background: 'white', borderRadius: '10px',
                display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
            }}>
                {/* Header */}
                <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Whiteboard View</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                             onClick={() => fileInputRef.current.click()}
                             style={{ display:'flex', alignItems:'center', gap:'5px', padding:'8px 15px', background:'#2196f3', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' }}
                        >
                            <Upload size={18}/> Upload Image
                        </button>
                        <button 
                            onClick={() => setShowWhiteboardModal(false)}
                            style={{ background:'transparent', border:'none', cursor:'pointer' }}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    {whiteboardImage ? (
                        <img src={whiteboardImage} alt="Whiteboard" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }} />
                    ) : (
                        <div style={{ color: '#888' }}>No image on whiteboard. Upload one!</div>
                    )}
                </div>
            </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleWhiteboardUpload} />

      {/* 4. HUD CONTROLS */}
      {!showUsernameModal && (
        <>
            {/* Controls Info */}
            <div style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(255,255,255,0.9)', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <strong>Controls:</strong>
                <div style={{ fontSize: '13px', marginTop: '5px' }}>WASD / Arrows to Move</div>
                <div style={{ fontSize: '13px' }}>Drag Mouse to Look</div>
                <div style={{ fontSize: '13px' }}>Click Whiteboard to Zoom</div>
            </div>

            {/* Bottom Bar */}
            <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '15px' }}>
                <button 
                    onClick={isRecording ? stopVoiceCapture : startVoiceCapture}
                    style={{ padding: '15px 30px', borderRadius: '50px', border: 'none', background: isRecording ? '#ff4444' : '#222', color: 'white', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}
                >
                    {isRecording ? <MicOff size={20}/> : <Mic size={20}/>}
                    {isRecording ? "Stop Voice" : "Start Voice"}
                </button>
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    style={{ padding: '15px', borderRadius: '50%', border: 'none', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', cursor: 'pointer' }}
                >
                    {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                </button>
            </div>

            {/* Chat Box */}
            <div style={{ 
                position: 'absolute', bottom: 20, right: 20, 
                width: showChat ? '300px' : '60px', height: showChat ? '400px' : '60px',
                background: 'white', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                <button 
                    onClick={() => setShowChat(!showChat)}
                    style={{ width:'100%', height:'60px', border:'none', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                >
                    <MessageSquare size={24} color="#333" />
                </button>

                {showChat && (
                    <>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px', background: '#f9f9f9' }}>
                            {chatMessages.map((m, i) => (
                                <div key={i} style={{ marginBottom: '8px', textAlign: m.username === username ? 'right' : 'left' }}>
                                    <span style={{ fontSize: '10px', color: '#888' }}>{m.username}</span>
                                    <div style={{ background: m.username === username ? '#222' : '#ddd', color: m.username === username ? '#fff' : '#000', padding: '6px 10px', borderRadius: '10px', display: 'inline-block' }}>
                                        {m.message}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatMessagesEndRef} />
                        </div>
                        <div style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex' }}>
                            <input 
                                value={chatInput} 
                                onChange={e => setChatInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSendChatMessage()}
                                placeholder="Type..."
                                style={{ flex: 1, border: 'none', outline: 'none' }}
                            />
                            <button onClick={handleSendChatMessage} style={{ border: 'none', background: 'transparent', color: '#2196f3', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
                        </div>
                    </>
                )}
            </div>
        </>
      )}
    </div>
  );
}
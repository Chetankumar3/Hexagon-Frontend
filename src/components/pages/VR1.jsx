import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { io } from 'socket.io-client';
import API_CONFIG from '../../config/api.js';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare  } from "lucide-react";

// Whiteboard Texture Component
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
        (error) => {
          console.error('Error loading whiteboard texture:', error);
        }
      );
    }
    return () => {
      if (texture.current) {
        texture.current.dispose();
      }
    };
  }, [imageUrl]);

  if (!isLoaded || !texture.current) return null;

  return (
    <mesh position={[0, 0, 0.07]}>
      <planeGeometry args={[11.5, 5.5]} />
      <meshBasicMaterial map={texture.current} />
    </mesh>
  );
};

// Whiteboard Component
const Whiteboard = ({ imageUrl, onImageClick }) => {
  return (
    <group position={[0, 4, -8]}>
      {/* Whiteboard frame */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 6, 0.1]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>

      {/* Whiteboard surface - clickable */}
      <mesh
        position={[0, 0, 0.06]}
        receiveShadow
        onClick={onImageClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
        }}
      >
        <planeGeometry args={[11.5, 5.5]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.9}
        />
      </mesh>

      {/* Image on whiteboard */}
      {imageUrl && <WhiteboardTexture imageUrl={imageUrl} />}
    </group>
  );
};

// Simple Floor
const Floor = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial
        color="#e8eaf6"
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
};

// Elongated Table Component
const ElongatedTable = ({ position }) => {
  return (
    <group position={position}>
      {/* Main elongated tabletop */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, 0.15, 3]} />
        <meshStandardMaterial
          color="#5d4037"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Table legs - evenly distributed */}
      {[
        [-7, 0.375, 1.2],
        [-7, 0.375, -1.2],
        [-2.5, 0.375, 1.2],
        [-2.5, 0.375, -1.2],
        [2.5, 0.375, 1.2],
        [2.5, 0.375, -1.2],
        [7, 0.375, 1.2],
        [7, 0.375, -1.2]
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.75]} />
          <meshStandardMaterial color="#3e2723" />
        </mesh>
      ))}
    </group>
  );
};

// Big Comfortable Sofa
const BigSofa = ({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Sofa base/seat */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.6, 2]} />
        <meshStandardMaterial
          color="#1565c0"
          roughness={0.8}
        />
      </mesh>

      {/* Sofa backrest */}
      <mesh position={[0, 1.1, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[5, 1.4, 0.4]} />
        <meshStandardMaterial
          color="#1976d2"
          roughness={0.8}
        />
      </mesh>

      {/* Armrests */}
      <mesh position={[-2.3, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 1, 2]} />
        <meshStandardMaterial
          color="#1976d2"
          roughness={0.8}
        />
      </mesh>
      <mesh position={[2.3, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 1, 2]} />
        <meshStandardMaterial
          color="#1976d2"
          roughness={0.8}
        />
      </mesh>

      {/* Cushions for comfort detail */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 0.75, 0]} castShadow>
          <boxGeometry args={[1.2, 0.3, 1.5]} />
          <meshStandardMaterial
            color="#42a5f5"
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};

// Realistic Person Avatar
const PersonAvatar = ({ position, name, color = "#ffb74d", isSpeaking = false }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing animation
      const breathing = isSpeaking ? 0.05 : 0.02;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * breathing;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.5]} />
        <meshStandardMaterial
          color={isSpeaking ? color : color}
          roughness={0.7}
          emissive={isSpeaking ? color : "#000000"}
          emissiveIntensity={isSpeaking ? 0.3 : 0}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial
          color="#ffe0b2"
          roughness={0.6}
        />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.3, 0.5, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Name label */}
      <Text
        position={[0, 1.4, 0]}
        fontSize={0.15}
        color={isSpeaking ? "#1976d2" : "#1e293b"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#ffffff"
      >
        {name}
      </Text>
    </group>
  );
};

// Main Classroom Scene
const ClassroomScene = ({ speakingUsers = [], whiteboardImage, onWhiteboardClick }) => {
  // People sitting around the table
  const tablePositions = [
    { pos: [-6, 0.75, -2], name: "Alice", color: "#ef5350" },
    { pos: [-3, 0.75, -2], name: "Bob", color: "#42a5f5" },
    { pos: [0, 0.75, -2], name: "Carol", color: "#66bb6a" },
    { pos: [3, 0.75, -2], name: "David", color: "#ffa726" },
    { pos: [6, 0.75, -2], name: "Emma", color: "#ab47bc" },
    { pos: [-6, 0.75, 2], name: "Frank", color: "#26c6da" },
    { pos: [-3, 0.75, 2], name: "Grace", color: "#ec407a" },
    { pos: [0, 0.75, 2], name: "Henry", color: "#7e57c2" },
    { pos: [3, 0.75, 2], name: "Ivy", color: "#29b6f6" },
    { pos: [6, 0.75, 2], name: "Jack", color: "#9ccc65" }
  ];

  // People sitting on sofa
  const sofaPositions = [
    { pos: [-1.8, 0.7, 8], name: "Kate", color: "#ff7043" },
    { pos: [-0.6, 0.7, 8], name: "Leo", color: "#5c6bc0" },
    { pos: [0.6, 0.7, 8], name: "Mia", color: "#26a69a" },
    { pos: [1.8, 0.7, 8], name: "Noah", color: "#ffca28" }
  ];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      {/* Scene elements */}
      <Floor />

      {/* Elongated table */}
      <ElongatedTable position={[0, 0, 0]} />

      {/* People around table */}
      {tablePositions.map((person, i) => {
        const isSpeaking = speakingUsers.includes(person.name);
        return (
          <PersonAvatar
            key={`table-${i}`}
            position={person.pos}
            name={person.name}
            color={person.color}
            isSpeaking={isSpeaking}
          />
        );
      })}

      {/* Big sofa */}
      <BigSofa position={[0, 0, 9]} rotation={[0, Math.PI, 0]} />

      {/* People on sofa */}
      {sofaPositions.map((person, i) => {
        const isSpeaking = speakingUsers.includes(person.name);
        return (
          <PersonAvatar
            key={`sofa-${i}`}
            position={person.pos}
            name={person.name}
            color={person.color}
            isSpeaking={isSpeaking}
          />
        );
      })}

      {/* Whiteboard */}
      <Whiteboard imageUrl={whiteboardImage} onImageClick={onWhiteboardClick} />
    </>
  );
};

// Main App Component
export default function VRClassroom() {
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [backendUrl, setBackendUrl] = useState(API_CONFIG.getCustomBackendUrl() || API_CONFIG.getCurrentBackendUrl());
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState([]);
  const [error, setError] = useState('');
  const [whiteboardImage, setWhiteboardImage] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const chatMessagesEndRef = useRef(null);

  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioElementsRef = useRef({});
  const audioContextsRef = useRef({});
  const audioQueuesRef = useRef({});
  const speakingTimeoutRef = useRef({});
  const gainNodesRef = useRef({});

  // Initialize Socket.IO connection
  useEffect(() => {
    // Only connect after user has entered username and modal is closed
    if (!username || showUsernameModal) return;

    const currentBackendUrl = backendUrl || API_CONFIG.getCurrentBackendUrl();
    // Remove trailing slashes and ensure we don't duplicate /vr
    const baseUrl = currentBackendUrl.replace(/\/+$/, '').replace(/\/vr$/, '');
    const socketUrl = `${baseUrl}/vr`;
    console.log(`[VR] Connecting to: ${socketUrl}`);

    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('[VR] Connected to VR server, sending join event...');
      setIsConnected(true);
      setError('');
      // Automatically send join event when connected
      socketInstance.emit('join', { username: username.trim() });
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(`[VR] Disconnected from VR server. Reason: ${reason}`);
      setIsConnected(false);

      // If disconnected unexpectedly, try to reconnect
      if (reason === 'io server disconnect' || reason === 'transport close') {
        console.log('[VR] Attempting to reconnect...');
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[VR] Connection error:', error);
      setError(`Connection failed: ${error.message || 'Unable to connect to server'}`);
      setIsConnected(false);
    });

    socketInstance.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data.message || 'An error occurred');
    });

    socketInstance.on('joined', (data) => {
      console.log('Joined VR room:', data);
      setError('');
    });

    socketInstance.on('userJoined', (data) => {
      console.log('User joined:', data.username);
      setConnectedUsers((prev) => [...prev, { username: data.username, socketId: data.socketId }]);
    });

    socketInstance.on('userLeft', (data) => {
      console.log('User left:', data.username);
      setConnectedUsers((prev) => prev.filter((u) => u.socketId !== data.socketId));
      // Clean up audio element
      if (audioElementsRef.current[data.socketId]) {
        const audioEl = audioElementsRef.current[data.socketId];
        if (audioEl && typeof audioEl.pause === 'function') {
          audioEl.pause();
        }
        delete audioElementsRef.current[data.socketId];
      }
      // Clean up audio context
      if (audioContextsRef.current[data.socketId]) {
        const ctx = audioContextsRef.current[data.socketId];
        if (ctx && ctx.close) {
          ctx.close().catch(console.error);
        }
        delete audioContextsRef.current[data.socketId];
      }
      // Clean up gain node
      if (gainNodesRef.current[data.socketId]) {
        delete gainNodesRef.current[data.socketId];
      }
      // Clean up queue
      if (audioQueuesRef.current[data.socketId]) {
        delete audioQueuesRef.current[data.socketId];
      }
    });

    socketInstance.on('usersList', (data) => {
      console.log('Users list:', data.users);
      setConnectedUsers(data.users);
    });

    socketInstance.on('voice', (data) => {
      handleIncomingVoice(data);
    });

    socketInstance.on('userVoiceStart', (data) => {
      setSpeakingUsers((prev) => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
      // Clear timeout if exists
      if (speakingTimeoutRef.current[data.username]) {
        clearTimeout(speakingTimeoutRef.current[data.username]);
      }
      // Set timeout to remove speaking indicator after 2 seconds of silence
      speakingTimeoutRef.current[data.username] = setTimeout(() => {
        setSpeakingUsers((prev) => prev.filter((u) => u !== data.username));
      }, 2000);
    });

    socketInstance.on('userVoiceEnd', (data) => {
      setTimeout(() => {
        setSpeakingUsers((prev) => prev.filter((u) => u !== data.username));
      }, 500);
    });

    // Whiteboard events
    socketInstance.on('whiteboardUpdate', (data) => {
      console.log('Whiteboard updated:', data);
      if (data.imageUrl) {
        setWhiteboardImage(data.imageUrl);
      }
    });

    // Chat events
    socketInstance.on('chatMessage', (data) => {
      console.log('Chat message received:', data);
      setChatMessages((prev) => [...prev, data]);
      // Auto-scroll to bottom
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    socketInstance.on('chatHistory', (data) => {
      console.log('Chat history received:', data.messages);
      setChatMessages(data.messages || []);
      // Auto-scroll to bottom
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    setSocket(socketInstance);

    return () => {
      console.log('[VR] Cleaning up socket connection...');
      if (socketInstance.connected) {
        socketInstance.disconnect();
      }
      // Cleanup audio
      Object.values(audioElementsRef.current).forEach((audio) => {
        if (audio && typeof audio.pause === 'function') {
          audio.pause();
        }
      });
      audioElementsRef.current = {};

      // Cleanup audio contexts
      Object.values(audioContextsRef.current).forEach((ctx) => {
        if (ctx && ctx.close) {
          ctx.close().catch(console.error);
        }
      });
      audioContextsRef.current = {};

      // Cleanup queues
      audioQueuesRef.current = {};
      gainNodesRef.current = {};
    };
    // Only depend on username and showUsernameModal - backendUrl changes should not trigger reconnection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, showUsernameModal]);

  // Handle incoming voice data with proper streaming
  const handleIncomingVoice = (data) => {
    try {
      if (!data.audioData) return;

      // Decode base64 to Int16Array
      const binaryString = atob(data.audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to Int16Array
      const audioData = new Int16Array(bytes.buffer);

      // Get or create audio context for this user
      let audioContext = audioContextsRef.current[data.socketId];
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 44100,
        });
        audioContextsRef.current[data.socketId] = audioContext;

        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0;
        gainNode.connect(audioContext.destination);
        gainNodesRef.current[data.socketId] = gainNode;

        // Initialize queue
        audioQueuesRef.current[data.socketId] = [];
      }

      // Resume audio context if suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(console.error);
      }

      // Create audio buffer from chunk
      const audioBuffer = audioContext.createBuffer(1, audioData.length, 44100);
      const channelData = audioBuffer.getChannelData(0);

      // Convert Int16 to Float32
      for (let i = 0; i < audioData.length; i++) {
        channelData[i] = audioData[i] / 32768.0;
      }

      // Create source and connect to gain node
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNodesRef.current[data.socketId]);

      // Play immediately
      try {
        source.start(0);
      } catch (e) {
        // If start fails, queue it
        console.warn('Audio start failed, queueing:', e);
        if (!audioQueuesRef.current[data.socketId]) {
          audioQueuesRef.current[data.socketId] = [];
        }
        audioQueuesRef.current[data.socketId].push(source);
      }
    } catch (error) {
      console.error('Error handling incoming voice:', error);
    }
  };

  // File input ref for whiteboard
  const whiteboardFileInputRef = useRef(null);

  // Handle whiteboard click
  const handleWhiteboardClick = () => {
    whiteboardFileInputRef.current?.click();
  };

  // Handle whiteboard image upload
  const handleWhiteboardFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result;
        if (imageData && socket) {
          // Update local state immediately for better UX
          setWhiteboardImage(imageData);

          // Broadcast to all users in classroom
          socket.emit('whiteboardImage', {
            imageUrl: imageData,
            username: username,
          });
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input to allow selecting same file again
    if (whiteboardFileInputRef.current) {
      whiteboardFileInputRef.current.value = '';
    }
  };

  // Handle chat message send
  const handleSendChatMessage = () => {
    if (!chatInput.trim() || !socket) return;

    socket.emit('chatMessage', {
      message: chatInput.trim(),
    });

    setChatInput('');
  };

  // Handle chat input key press
  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  // Start voice capture
  const startVoiceCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      setIsRecording(true);

      // Create AudioContext for processing
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!socket || isMuted || !isRecording) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const buffer = new Int16Array(inputData.length);

        for (let i = 0; i < inputData.length; i++) {
          buffer[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }

        // Convert Int16Array to base64 for transmission
        // Convert Int16Array to Uint8Array (little-endian)
        const uint8Array = new Uint8Array(buffer.buffer);
        const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
        const base64Audio = btoa(binaryString);

        // Send audio data
        socket.emit('voice', {
          audioData: base64Audio,
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      socket.emit('voiceStart');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  // Stop voice capture
  const stopVoiceCapture = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
    if (socket) {
      socket.emit('voiceEnd');
    }
  };

  // Handle join
  const handleJoin = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    // Save custom backend URL if provided
    if (backendUrl && backendUrl !== API_CONFIG.getCurrentBackendUrl()) {
      API_CONFIG.setCustomBackendUrl(backendUrl);
    }

    // Close modal - socket will connect automatically in useEffect
    setShowUsernameModal(false);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoiceCapture();
      if (socket) {
        socket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(to bottom, #e3f2fd 0%, #bbdefb 100%)'
    }}>
      {/* Username Modal */}
      {showUsernameModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            width: '90%',
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#000000',
              textAlign: 'center',
            }}>
              Join VR Classroom
            </h2>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '10px',
              padding: '10px',
              background: '#f5f5f5',
              borderRadius: '6px',
            }}>
              <strong>Network Connection:</strong> If connecting from another device, enter the server IP address:
            </div>
            <input
              type="text"
              placeholder="Backend URL (e.g., http://192.168.1.100:5003)"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{
              fontSize: '11px',
              color: '#999',
              marginBottom: '15px',
              fontStyle: 'italic',
              padding: '5px',
            }}>
              {/* Leave empty to use default (localhost). For network connections, use: http://[SERVER_IP]:5003 */}
            </div>
            {error && (
              <div style={{
                color: '#d32f2f',
                fontSize: '14px',
                marginBottom: '15px',
              }}>
                {error}
              </div>
            )}
            <button
              onClick={handleJoin}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                background: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = '#353535'}
              onMouseOut={(e) => e.target.style.background = '#000000'}
            >
              Join Room
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1e293b',
          fontSize: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Loading...
        </div>
      ) : (
        <Canvas
          shadows
          gl={{ antialias: true }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            setLoading(false);
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 8, 18]} fov={60} />
          <Suspense fallback={null}>
            <ClassroomScene
              speakingUsers={speakingUsers}
              whiteboardImage={whiteboardImage}
              onWhiteboardClick={handleWhiteboardClick}
            />
          </Suspense>
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            maxDistance={40}
            minDistance={5}
            maxPolarAngle={Math.PI / 2.1}
          />
          <fog attach="fog" args={['#e3f2fd', 20, 60]} />
        </Canvas>
      )}

      {/* Hidden file input for whiteboard (outside Canvas) */}
      <input
        ref={whiteboardFileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleWhiteboardFileChange}
      />

      {/* Voice Controls */}
      {!showUsernameModal && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 100,
        }}>
          <button
            onClick={isRecording ? stopVoiceCapture : startVoiceCapture}
            style={{
              padding: '15px 25px',
              fontSize: '16px',
              fontWeight: '600',
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isRecording ? (
              <>
                <MicOff size={24} />
              </>
            ) : (
              <>
                <Mic size={24} />
              </>
            )}

          </button>
          <button
            onClick={toggleMute}
            style={{
              padding: '15px 25px',
              fontSize: '16px',
              fontWeight: '600',
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      )}

      {/* Chat Panel */}
      {!showUsernameModal && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: showChat ? '350px' : '60px',
          height: showChat ? '600px' : '',
          background: showChat ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          border: '1px solid #000000',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          zIndex: 100,
        }}>
          {/* Chat Toggle Button */}
          <button
            onClick={() => setShowChat(!showChat)}
            style={{
              width: '100%',
              padding: '15px',
              background: showChat ? '#transparent' : '#000000',
              color: showChat ? '#000000' : '#ffffff',
              border: 'none',
              borderRadius: showChat ? '0' : '12px',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
            }}
          >
            <MessageSquare size={24} />
          </button>

          {showChat && (
            <>
              {/* Chat Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: '#ffffff',
              }}>
                {chatMessages.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#666666',
                    fontSize: '14px',
                    marginTop: '20px',
                  }}>
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => {
                    const isOwnMessage = msg.username === username;
                    const messageTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                          marginBottom: '8px',
                        }}
                      >
                        <div style={{
                          background: isOwnMessage ? '#000000' : '#e0e0e0',
                          color: isOwnMessage ? '#ffffff' : '#000000',
                          padding: '8px 12px',
                          borderRadius: '12px',
                          maxWidth: '80%',
                          wordWrap: 'break-word',
                          fontSize: '14px',
                          border: '1px solid #000000',
                        }}>
                          {!isOwnMessage && (
                            <div style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              marginBottom: '4px',
                              color: '#000000',
                              opacity: 0.8,
                            }}>
                              {msg.username}
                            </div>
                          )}
                          <div>{msg.message}</div>
                          <div style={{
                            fontSize: '10px',
                            opacity: 0.7,
                            marginTop: '4px',
                            textAlign: 'right',
                          }}>
                            {messageTime}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Chat Input */}
              <div style={{
                padding: '15px',
                borderTop: '1px solid #000000',
                display: 'flex',
                gap: '10px',
                background: '#ffffff',
              }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '2px solid #000000',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#ffffff',
                    color: '#000000',
                  }}
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatInput.trim()}
                  style={{
                    padding: '10px 20px',
                    background: chatInput.trim() ? '#000000' : '#cccccc',
                    color: chatInput.trim() ? '#ffffff' : '#666666',
                    border: '1px solid #000000',
                    borderRadius: '8px',
                    cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Instructions Box */}
      {!showUsernameModal && (
        <div style={{
          position: 'absolute',
          top: 100,
          left: 20,
          color: '#000000',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          border: '1px solid #000000',
          Width: '350px'
        }}>
          <h2 style={{
            margin: '30px 0 15px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#000000'
          }}>
            VR Classroom
          </h2>
          <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#666666' }}>
            <p style={{ margin: '8px 0' }}>
              <strong style={{ color: '#000000' }}>Left Drag:</strong> Rotate view
            </p>
            <p style={{ margin: '8px 0' }}>
              <strong style={{ color: '#000000' }}>Right Drag:</strong> Pan camera
            </p>
            <p style={{ margin: '8px 0' }}>
              <strong style={{ color: '#000000' }}>Scroll:</strong> Zoom in/out
            </p>
            <p style={{ margin: '8px 0' }}>
              <strong style={{ color: '#000000' }}>Voice:</strong> Click Start Voice to talk
            </p>
            <p style={{ margin: '8px 0' }}>
              <strong style={{ color: '#000000' }}>Whiteboard:</strong> Click the whiteboard to add images
            </p>
            <p style={{ margin: '8px 0' }}>
              <strong style={{ color: '#000000' }}>Chat:</strong> Click chat button to open group chat
            </p>
          </div>
        </div>
      )}

      {/* Connection Status & Users */}
      {!showUsernameModal && (
        <div style={{
          position: 'absolute',
          top: 340,
          left: 20,
          color: '#000000',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          border: '1px solid #000000',
          width: '350px',
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: '700',
            color: '#000000',
          }}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </h3>
          <div style={{ fontSize: '14px', marginBottom: '10px', color: '#666666' }}>
            <strong style={{ color: '#000000' }}>Your Username:</strong> {username}
          </div>
          <div style={{ fontSize: '14px', marginBottom: '15px', color: '#666666' }}>
            <strong style={{ color: '#000000' }}>Connected Users:</strong> {connectedUsers.length + 1}
          </div>
          {connectedUsers.length > 0 && (
            <div style={{ fontSize: '12px', color: '#666666' }}>
              <strong style={{ color: '#000000' }}>Online:</strong>
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                {connectedUsers.map((user) => (
                  <li key={user.socketId}>{user.username}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
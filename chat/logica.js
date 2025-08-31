document.addEventListener('DOMContentLoaded', function() {
    // Elementos de la interfaz
    const localVideo = document.getElementById('localVideo');
    const videoContainer = document.getElementById('videoContainer');
    const toggleChatBtn = document.getElementById('toggleChat');
    const expandChatBtn = document.getElementById('expandChatBtn');
    const chatContainer = document.getElementById('chatContainer');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    const toggleVideoBtn = document.getElementById('toggleVideo');
    const toggleAudioBtn = document.getElementById('toggleAudio');
    const toggleVideoSmallBtn = document.getElementById('toggleVideoSmall');
    const toggleAudioSmallBtn = document.getElementById('toggleAudioSmall');
    const endCallBtn = document.getElementById('endCall');
    const inviteButton = document.getElementById('inviteButton');
    const invitationPanel = document.getElementById('invitationPanel');
    const closeInvitationBtn = document.getElementById('closeInvitation');
    const meetCodeInput = document.getElementById('meetCodeInput');
    const meetLinkInput = document.getElementById('meetLinkInput');
    const copyLinkOption = document.getElementById('copyLinkOption');
    const shareWhatsApp = document.getElementById('shareWhatsApp');
    const shareEmail = document.getElementById('shareEmail');
    const incomingCall = document.getElementById('incomingCall');
    const acceptCallBtn = document.getElementById('acceptCall');
    const rejectCallBtn = document.getElementById('rejectCall');
    const meetCodeElement = document.getElementById('meetCode');
    const joinCodeInput = document.getElementById('joinCodeInput');
    const joinMeetingBtn = document.getElementById('joinMeeting');
    const cancelJoinBtn = document.getElementById('cancelJoin');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const currentTime = document.getElementById('currentTime');
    const currentTime2 = document.getElementById('currentTime2');
    const localConnectionStatus = document.getElementById('localConnectionStatus');
    
    // Configuración de WebRTC con servidores STUN/TURN públicos
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { 
                urls: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            },
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            }
        ]
    };
    
    // Variables de estado WebRTC
    let localStream = null;
    let peerConnection = null;
    let dataChannel = null;
    let isInitiator = false;
    let isChatCollapsed = false;
    let isVideoEnabled = true;
    let isAudioEnabled = true;
    let meetCode = generateMeetCode();
    const baseURL = "https://cubarro.github.io/utiles/chat";
    
    // Inicializar la aplicación
    initMedia();
    setupEventListeners();
    updateMeetCode();
    updateTime();
    
    // Configuración de event listeners
    function setupEventListeners() {
        // Alternar visibilidad del chat
        toggleChatBtn.addEventListener('click', toggleChat);
        expandChatBtn.addEventListener('click', expandChat);
        
        // Enviar mensaje de chat
        sendMessageBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Alternar video y audio
        toggleVideoBtn.addEventListener('click', toggleVideo);
        toggleAudioBtn.addEventListener('click', toggleAudio);
        toggleVideoSmallBtn.addEventListener('click', toggleVideo);
        toggleAudioSmallBtn.addEventListener('click', toggleAudio);
        
        // Finalizar llamada
        endCallBtn.addEventListener('click', endCall);
        
        // Invitaciones
        inviteButton.addEventListener('click', showInvitationPanel);
        closeInvitationBtn.addEventListener('click', hideInvitationPanel);
        copyLinkOption.addEventListener('click', copyMeetingLink);
        shareWhatsApp.addEventListener('click', shareViaWhatsApp);
        shareEmail.addEventListener('click', shareViaEmail);
        
        // Unirse a reunión
        joinMeetingBtn.addEventListener('click', joinMeeting);
        cancelJoinBtn.addEventListener('click', hideInvitationPanel);
        
        // Llamadas entrantes
        acceptCallBtn.addEventListener('click', acceptCall);
        rejectCallBtn.addEventListener('click', rejectCall);
        
        // Tabs del panel de invitación
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                activateTab(tabId);
            });
        });
        
        // Comprobar parámetros de URL para unirse a sala
        checkURLParams();
    }
    
    // Inicializar la cámara y el micrófono
    async function initMedia() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            localVideo.srcObject = localStream;
            
            // Inicializar conexión WebRTC
            createPeerConnection();
            
            // Simular la adición de participantes remotos después de un tiempo
            setTimeout(() => {
                simulateRemoteConnection();
            }, 2000);
            
        } catch (error) {
            console.error('Error al acceder a los dispositivos multimedia:', error);
            alert('No se pudo acceder a la cámara o micrófono. Asegúrate de conceder los permisos necesarios.');
        }
    }
    
    // Crear conexión peer-to-peer
    function createPeerConnection() {
        peerConnection = new RTCPeerConnection(configuration);
        
        // Agregar stream local
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        
        // Manejar stream remoto
        peerConnection.ontrack = (event) => {
            const remoteStream = event.streams[0];
            addRemoteVideo(remoteStream);
        };
        
        // Manejar canales de datos para chat
        peerConnection.ondatachannel = (event) => {
            const channel = event.channel;
            setupDataChannel(channel);
        };
        
        // Crear canal de datos si somos el iniciador
        if (isInitiator) {
            dataChannel = peerConnection.createDataChannel('chat');
            setupDataChannel(dataChannel);
        }
        
        // Manejar ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // En una aplicación real, enviaríamos el candidato al peer remoto
                console.log('Nuevo ICE candidate:', event.candidate);
            }
        };
        
        // Manejar cambios de estado de conexión
        peerConnection.onconnectionstatechange = () => {
            updateConnectionStatus(peerConnection.connectionState);
        };
    }
    
    // Configurar canal de datos para chat
    function setupDataChannel(channel) {
        dataChannel = channel;
        
        dataChannel.onopen = () => {
            console.log('Canal de datos abierto');
            addMessageToChat('Conexión establecida. ¡Puedes chatear!', false);
        };
        
        dataChannel.onmessage = (event) => {
            addMessageToChat(event.data, false);
        };
        
        dataChannel.onclose = () => {
            console.log('Canal de datos cerrado');
        };
    }
    
    // Simular conexión remota (en una aplicación real, esto se haría mediante señalización)
    async function simulateRemoteConnection() {
        try {
            // Crear una oferta
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            // Crear una respuesta simulada que cumpla con los estándares WebRTC
            // En una aplicación real, esto se recibiría del otro peer
            const simulatedRemotePC = new RTCPeerConnection(configuration);
            
            // Agregar un stream simulado (en una app real sería el stream del peer remoto)
            try {
                const remoteStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                remoteStream.getTracks().forEach(track => {
                    simulatedRemotePC.addTrack(track, remoteStream);
                });
            } catch (error) {
                console.log('No se pudo obtener medios para simulación, continuando sin ellos');
            }
            
            // Configurar el canal de datos para el peer simulado
            simulatedRemotePC.ondatachannel = (event) => {
                const channel = event.channel;
                channel.onmessage = (event) => {
                    // Simular respuesta automática
                    setTimeout(() => {
                        if (dataChannel && dataChannel.readyState === 'open') {
                            dataChannel.send('Respuesta automática: ' + event.data);
                        }
                    }, 1000);
                };
            };
            
            // Establecer la descripción remota
            await simulatedRemotePC.setRemoteDescription(offer);
            
            // Crear respuesta
            const answer = await simulatedRemotePC.createAnswer();
            await simulatedRemotePC.setLocalDescription(answer);
            
            // Establecer la descripción local con la respuesta
            await peerConnection.setRemoteDescription(answer);
            
            console.log('Conexión WebRTC simulada establecida correctamente');
            
        } catch (error) {
            console.error('Error en la simulación de conexión:', error);
            // Fallback: simular conexión sin WebRTC completo
            addMessageToChat('Modo simulación: WebRTC no está completamente disponible', false);
        }
    }
    
    // Añadir video remoto
    function addRemoteVideo(stream) {
        // Eliminar estado vacío si existe
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        const videoElement = document.createElement('div');
        videoElement.className = 'video-item';
        videoElement.innerHTML = `
            <video autoplay></video>
            <div class="participant-name">Usuario Remoto</div>
            <div class="connection-status">Conectado</div>
        `;
        
        videoElement.querySelector('video').srcObject = stream;
        videoContainer.appendChild(videoElement);
    }
    
    // Actualizar estado de conexión
    function updateConnectionStatus(state) {
        let statusText, statusClass;
        
        switch(state) {
            case 'connected':
                statusText = 'Conectado';
                statusClass = '';
                break;
            case 'connecting':
                statusText = 'Conectando...';
                statusClass = 'connecting';
                break;
            case 'disconnected':
                statusText = 'Desconectado';
                statusClass = 'disconnected';
                break;
            case 'failed':
                statusText = 'Error de conexión';
                statusClass = 'disconnected';
                break;
            default:
                statusText = state;
                statusClass = '';
        }
        
        if (localConnectionStatus) {
            localConnectionStatus.textContent = statusText;
            localConnectionStatus.className = `connection-status ${statusClass}`;
        }
    }
    
    // Alternar visibilidad del chat
    function toggleChat() {
        isChatCollapsed = true;
        chatContainer.classList.add('chat-collapsed');
        chatContainer.classList.remove('chat-expanded');
    }
    
    // Expandir el chat
    function expandChat() {
        isChatCollapsed = false;
        chatContainer.classList.remove('chat-collapsed');
        chatContainer.classList.add('chat-expanded');
    }
    
    // Enviar mensaje de chat
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // Agregar mensaje propio al chat
            addMessageToChat(message, true);
            
            // Enviar mensaje a través del canal de datos (si está disponible)
            if (dataChannel && dataChannel.readyState === 'open') {
                dataChannel.send(message);
            } else {
                // Simular respuesta si no hay conexión WebRTC
                setTimeout(() => {
                    addMessageToChat("¡Hola! Recibí tu mensaje: " + message, false);
                }, 1000);
            }
            
            // Limpiar input
            messageInput.value = '';
        }
    }
    
    // Agregar mensaje al chat
    function addMessageToChat(message, isOwn) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isOwn ? 'own' : 'remote'}`;
        messageElement.innerHTML = `
            ${message}
            <div class="message-time">${timeString}</div>
        `;
        chatMessages.appendChild(messageElement);
        
        // Auto-scroll al último mensaje
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Alternar video
    function toggleVideo() {
        if (localStream) {
            isVideoEnabled = !isVideoEnabled;
            localStream.getVideoTracks()[0].enabled = isVideoEnabled;
            updateButtonState(toggleVideoBtn, isVideoEnabled);
            updateButtonState(toggleVideoSmallBtn, isVideoEnabled);
        }
    }
    
    // Alternar audio
    function toggleAudio() {
        if (localStream) {
            isAudioEnabled = !isAudioEnabled;
            localStream.getAudioTracks()[0].enabled = isAudioEnabled;
            updateButtonState(toggleAudioBtn, isAudioEnabled);
            updateButtonState(toggleAudioSmallBtn, isAudioEnabled);
        }
    }
    
    // Actualizar estado visual de botones
    function updateButtonState(button, isEnabled) {
        if (isEnabled) {
            button.classList.remove('btn-active');
        } else {
            button.classList.add('btn-active');
        }
    }
    
    // Finalizar llamada
    function endCall() {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        
        // Redirigir o mostrar mensaje de llamada finalizada
        alert('Llamada finalizada. Todas las conexiones se han cerrado.');
    }
    
    // Generar código de reunión aleatorio
    function generateMeetCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 12; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
            if ((i + 1) % 4 === 0 && i < 11) {
                code += '-';
            }
        }
        return code;
    }
    
    // Actualizar código de reunión en la UI
    function updateMeetCode() {
        meetCodeElement.textContent = `Código: ${meetCode}`;
        meetCodeInput.value = meetCode;
        meetLinkInput.value = `${baseURL}?room=${meetCode}`;
    }
    
    // Mostrar panel de invitación
    function showInvitationPanel() {
        invitationPanel.style.display = 'block';
        activateTab('invite');
    }
    
    // Ocultar panel de invitación
    function hideInvitationPanel() {
        invitationPanel.style.display = 'none';
    }
    
    // Copiar enlace de la reunión
    function copyMeetingLink() {
        meetLinkInput.select();
        document.execCommand('copy');
        copyLinkOption.innerHTML = '<i class="fas fa-check"></i> <span>Enlace copiado!</span>';
        setTimeout(() => {
            copyLinkOption.innerHTML = '<i class="fas fa-copy"></i> <span>Copiar enlace</span>';
        }, 2000);
    }
    
    // Compartir por WhatsApp
    function shareViaWhatsApp() {
        const message = encodeURIComponent(`¡Únete a mi videollamada! Usa este enlace: ${baseURL}?room=${meetCode}`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
    }
    
    // Compartir por correo
    function shareViaEmail() {
        const subject = encodeURIComponent('Invitación a videollamada');
        const body = encodeURIComponent(`Hola,\n\n¡Te invito a unirte a mi videollamada!\n\nUsa este enlace para unirte: ${baseURL}?room=${meetCode}\n\nCódigo de sala: ${meetCode}\n\n¡Te espero!`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
    
    // Unirse a una reunión
    function joinMeeting() {
        const code = joinCodeInput.value.trim();
        if (code && code.length === 14) { // XXXX-XXXX-XXXX
            window.location.href = `${baseURL}?room=${code}`;
        } else {
            alert('Por favor, ingresa un código de reunión válido (formato: XXXX-XXXX-XXXX)');
        }
    }
    
    // Comprobar parámetros de URL
    function checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const room = urlParams.get('room');
        
        if (room) {
            meetCode = room;
            updateMeetCode();
            addMessageToChat(`Te has unido a la sala: ${room}`, false);
            isInitiator = false;
        } else {
            isInitiator = true;
        }
    }
    
    // Mostrar llamada entrante (simulación)
    function showIncomingCall() {
        incomingCall.style.display = 'block';
    }
    
    // Aceptar llamada entrante
    function acceptCall() {
        incomingCall.style.display = 'none';
        addMessageToChat('Llamada de María aceptada', false);
        
        // En una app real, aquí se establecería la conexión WebRTC
    }
    
    // Rechazar llamada entrante
    function rejectCall() {
        incomingCall.style.display = 'none';
        addMessageToChat('Llamada de María rechazada', false);
    }
    
    // Activar pestaña
    function activateTab(tabId) {
        // Desactivar todas las pestañas
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Activar la pestaña seleccionada
        document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}Tab`).classList.add('active');
    }
    
    // Actualizar hora actual
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        if (currentTime) currentTime.textContent = timeString;
        if (currentTime2) currentTime2.textContent = timeString;
    }
    
    // Actualizar la hora cada minuto
    setInterval(updateTime, 60000);
    
    // Simular una llamada entrante después de 5 segundos (para demo)
    setTimeout(showIncomingCall, 5000);
});


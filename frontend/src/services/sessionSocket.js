import { io } from 'socket.io-client';

const DEFAULT_SOCKET_URL = 'https://team-d-excellence-hackbyifri-2026.onrender.com';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || DEFAULT_SOCKET_URL;

class SessionSocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to session socket');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from session socket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Session socket error:', error);
    });

    return this.socket;
  }

  registerUser(userId) {
    if (this.socket) {
      this.socket.emit('register-user', { userId });
    }
  }

  joinSession(sessionId, user, role) {
    if (this.socket) {
      this.socket.emit('join-session', {
        sessionId,
        userId: user.id,
        role,
        userInfo: {
          nom: user.nom,
          prenom: user.prenom,
          avatar_url: user.avatar_url
        }
      });
    }
  }

  leaveSession(sessionId, userId) {
    if (this.socket) {
      this.socket.emit('leave-session', { sessionId, userId });
    }
  }

  sendMessage(sessionId, user, message, options = {}) {
    const {
      type = 'text',
      file_url = null,
      file_meta = null
    } = options;

    if (this.socket) {
      this.socket.emit('send-message', {
        sessionId,
        userId: user.id,
        userInfo: {
          nom: user.nom,
          prenom: user.prenom,
          avatar_url: user.avatar_url
        },
        message,
        type,
        file_url,
        file_meta
      });
    }
  }

  whiteboardDraw(sessionId, payload = {}) {
    if (this.socket) {
      this.socket.emit('whiteboard-draw', {
        sessionId,
        ...payload
      });
    }
  }

  codeUpdate(sessionId, code, language) {
    if (this.socket) {
      this.socket.emit('code-update', {
        sessionId,
        code,
        language
      });
    }
  }

  textUpdate(sessionId, text) {
    if (this.socket) {
      this.socket.emit('text-update', {
        sessionId,
        text
      });
    }
  }

  requestWhiteboardSync(sessionId) {
    if (this.socket) {
      this.socket.emit('whiteboard-sync-request', { sessionId });
    }
  }


  typingStart(sessionId, user) {
    if (this.socket) {
      this.socket.emit('typing-start', {
        sessionId,
        userId: user.id,
        userInfo: {
          nom: user.nom,
          prenom: user.prenom,
          avatar_url: user.avatar_url
        }
      });
    }
  }

  typingStop(sessionId, user) {
    if (this.socket) {
      this.socket.emit('typing-stop', {
        sessionId,
        userId: user.id,
        userInfo: {
          nom: user.nom,
          prenom: user.prenom,
          avatar_url: user.avatar_url
        }
      });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onMessageUpdate(callback) {
    if (this.socket) {
      this.socket.on('message-update', callback);
    }
  }

  onParticipantUpdate(callback) {
    if (this.socket) {
      this.socket.on('participant-update', callback);
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on('typing', callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on('session-error', callback);
      this.socket.on('message-error', callback);
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  onSessionRole(callback) {
    if (this.socket) {
      this.socket.on('session-role', callback);
    }
  }

  onWhiteboardUpdate(callback) {
    if (this.socket) {
      this.socket.on('whiteboard-update', callback);
    }
  }

  onWhiteboardState(callback) {
    if (this.socket) {
      this.socket.on('whiteboard-state', callback);
    }
  }

  onCodeUpdate(callback) {
    if (this.socket) {
      this.socket.on('code-update', callback);
    }
  }

  onTextUpdate(callback) {
    if (this.socket) {
      this.socket.on('text-update', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SessionSocketService();

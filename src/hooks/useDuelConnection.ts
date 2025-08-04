import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export interface DuelMessage {
  type: 'player_action' | 'player_shocked' | 'player_ready' | 'game_start' | 'game_end' | 'sync_state';
  playerId: string;
  data?: any;
  timestamp: number;
}

export interface DuelRoom {
  id: string;
  players: string[];
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  createdAt: number;
}

export const useDuelConnection = () => {
  const { player } = useGameStore();
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<DuelRoom | null>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [messages, setMessages] = useState<DuelMessage[]>([]);
  
  // Симуляция WebSocket соединения (в реальной версии здесь будет WebSocket)
  const connectionRef = useRef<any>(null);
  const messageQueueRef = useRef<DuelMessage[]>([]);

  // Симуляция подключения к серверу
  const connect = useCallback(() => {
    console.log('🔌 Подключение к серверу дуэлей...');
    
    // Симуляция задержки подключения
    setTimeout(() => {
      setIsConnected(true);
      console.log('✅ Подключено к серверу дуэлей');
      
      // Симуляция входящих сообщений
      connectionRef.current = setInterval(() => {
        if (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message) {
            setMessages(prev => [...prev, message]);
          }
        }
      }, 100);
    }, 1000);
  }, []);

  // Отключение
  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      clearInterval(connectionRef.current);
      connectionRef.current = null;
    }
    setIsConnected(false);
    setCurrentRoom(null);
    setOpponent(null);
    setMessages([]);
    console.log('🔌 Отключено от сервера дуэлей');
  }, []);

  // Поиск дуэли
  const findDuel = useCallback(async (): Promise<DuelRoom> => {
    if (!isConnected) {
      throw new Error('Не подключен к серверу');
    }

    console.log('🔍 Поиск дуэли...');
    
    // Симуляция поиска противника
    return new Promise((resolve) => {
      setTimeout(() => {
        const room: DuelRoom = {
          id: `duel_${Date.now()}`,
          players: [player.id, 'bot_opponent'],
          status: 'waiting',
          createdAt: Date.now()
        };
        
        const botOpponent = {
          id: 'bot_opponent',
          name: `Соперник ${Math.floor(Math.random() * 1000)}`,
          level: Math.max(1, player.level - 2 + Math.floor(Math.random() * 5)),
          volts: Math.floor(Math.random() * 500) + 100,
          isReady: false,
          score: 0,
          streak: 0
        };

        setCurrentRoom(room);
        setOpponent(botOpponent);
        
        console.log('✅ Дуэль найдена!', room);
        resolve(room);
      }, 2000 + Math.random() * 3000); // 2-5 секунд поиска
    });
  }, [isConnected, player.id, player.level]);

  // Отправка сообщения
  const sendMessage = useCallback((message: Omit<DuelMessage, 'timestamp'>) => {
    if (!isConnected || !currentRoom) {
      console.warn('⚠️ Не удалось отправить сообщение: нет соединения или комнаты');
      return;
    }

    const fullMessage: DuelMessage = {
      ...message,
      timestamp: Date.now()
    };

    console.log('📤 Отправка сообщения:', fullMessage);

    // Симуляция ответа противника
    if (message.type === 'player_ready') {
      setTimeout(() => {
        messageQueueRef.current.push({
          type: 'player_ready',
          playerId: 'bot_opponent',
          timestamp: Date.now()
        });
      }, 1000 + Math.random() * 2000);
    }

    if (message.type === 'player_action') {
      // Симуляция действий противника в ответ
      setTimeout(() => {
        const opponentAction = Math.random() < 0.6; // 60% шанс что противник тоже кликнет
        if (opponentAction) {
          messageQueueRef.current.push({
            type: Math.random() < 0.2 ? 'player_shocked' : 'player_action',
            playerId: 'bot_opponent',
            data: {
              points: Math.floor(Math.random() * 60) + 20,
              volts: Math.floor(Math.random() * 40) + 10
            },
            timestamp: Date.now()
          });
        }
      }, 500 + Math.random() * 2000);
    }
  }, [isConnected, currentRoom]);

  // Готовность к игре
  const setReady = useCallback(() => {
    sendMessage({
      type: 'player_ready',
      playerId: player.id
    });
  }, [sendMessage, player.id]);

  // Действие игрока
  const sendPlayerAction = useCallback((points: number, volts: number) => {
    sendMessage({
      type: 'player_action',
      playerId: player.id,
      data: { points, volts }
    });
  }, [sendMessage, player.id]);

  // Удар током
  const sendPlayerShocked = useCallback((damage: number) => {
    sendMessage({
      type: 'player_shocked',
      playerId: player.id,
      data: { damage }
    });
  }, [sendMessage, player.id]);

  // Покинуть дуэль
  const leaveDuel = useCallback(() => {
    if (currentRoom) {
      sendMessage({
        type: 'game_end',
        playerId: player.id,
        data: { reason: 'left' }
      });
    }
    setCurrentRoom(null);
    setOpponent(null);
    setMessages([]);
  }, [currentRoom, sendMessage, player.id]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    currentRoom,
    opponent,
    messages,
    connect,
    disconnect,
    findDuel,
    setReady,
    sendPlayerAction,
    sendPlayerShocked,
    leaveDuel,
    setOpponent // Для обновления состояния противника
  };
};

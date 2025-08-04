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
  const aiIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAiActionRef = useRef<number>(0);

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
    if (aiIntervalRef.current) {
      clearInterval(aiIntervalRef.current);
      aiIntervalRef.current = null;
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
      // ИИ НЕ отвечает на каждое действие игрока - только периодически
      const now = Date.now();
      const timeSinceLastAi = now - lastAiActionRef.current;
      
      // ИИ действует только раз в 2-4 секунды (человеческий темп)
      if (timeSinceLastAi > 2000 && Math.random() < 0.3) {
        lastAiActionRef.current = now;
        setTimeout(() => {
          const gotShocked = Math.random() < 0.25; // 25% шанс удара током
          if (gotShocked) {
            messageQueueRef.current.push({
              type: 'player_shocked',
              playerId: 'bot_opponent',
              data: { damage: 20 + Math.random() * 30 },
              timestamp: Date.now()
            });
          } else {
            messageQueueRef.current.push({
              type: 'player_action',
              playerId: 'bot_opponent',
              data: {
                points: Math.floor(Math.random() * 50) + 15, // 15-65 очков
                volts: Math.floor(Math.random() * 30) + 10   // 10-40 вольт
              },
              timestamp: Date.now()
            });
          }
        }, 800 + Math.random() * 1500); // 0.8-2.3 сек задержка
      }
    }
  }, [isConnected, currentRoom]);

  // Готовность к игре
  const setReady = useCallback(() => {
    sendMessage({
      type: 'player_ready',
      playerId: player.id
    });
    
    // Запускаем независимую симуляцию ИИ с человеческим темпом
    setTimeout(() => {
      aiIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const shouldAct = Math.random() < 0.4; // 40% шанс действия каждые 2-3 сек
        
        if (shouldAct) {
          const gotShocked = Math.random() < 0.25; // 25% шанс удара током
          if (gotShocked) {
            messageQueueRef.current.push({
              type: 'player_shocked',
              playerId: 'bot_opponent',
              data: { damage: 20 + Math.random() * 30 },
              timestamp: now
            });
          } else {
            messageQueueRef.current.push({
              type: 'player_action',
              playerId: 'bot_opponent',
              data: {
                points: Math.floor(Math.random() * 50) + 15, // 15-65 очков за клик
                volts: Math.floor(Math.random() * 30) + 10   // 10-40 вольт
              },
              timestamp: now
            });
          }
        }
      }, 2000 + Math.random() * 1500); // Каждые 2-3.5 секунды
    }, 3000); // Начинаем через 3 секунды после готовности
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
    
    // Останавливаем ИИ симуляцию
    if (aiIntervalRef.current) {
      clearInterval(aiIntervalRef.current);
      aiIntervalRef.current = null;
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

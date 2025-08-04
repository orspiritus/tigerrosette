import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useTelegram } from './TelegramProvider';
import { hapticManager } from '../utils/hapticManager';

interface IncomingDuelInvite {
  id: string;
  fromUserId: number;
  fromUserName: string;
  fromUserLevel: number;
  message: string;
  receivedAt: number;
  expiresAt: number;
}

export const DuelInviteReceiver: React.FC = () => {
  const { player, startMultiplayerMode } = useGameStore();
  const { webApp, user, isInTelegram } = useTelegram();
  const [incomingInvites, setIncomingInvites] = useState<IncomingDuelInvite[]>([]);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  // Слушаем входящие приглашения
  useEffect(() => {
    if (isInTelegram && webApp) {
      // Проверяем URL параметры на наличие приглашения
      const urlParams = new URLSearchParams(window.location.search);
      const inviteId = urlParams.get('duel') || urlParams.get('duel_invite');
      
      console.log('🔍 URL parameters:', window.location.search);
      console.log('🎯 Duel ID found:', inviteId);
      
      if (inviteId) {
        console.log('🎯 Found duel ID in URL, fetching duel info...');
        fetchDuelInfo(inviteId);
      }

      // В реальной версии здесь будет подписка на события WebApp
      console.log('Слушаем приглашения на дуэли...');
    }
  }, [isInTelegram, webApp]);

  // Fetch real duel information from backend
  const fetchDuelInfo = async (duelId: string) => {
    try {
      console.log('🔍 Fetching duel info for ID:', duelId);
      const response = await fetch(`http://localhost:3001/api/duels/info/${duelId}`);
      const data = await response.json();
      
      if (data.success && data.duel) {
        console.log('✅ Duel info received:', data.duel);
        const duelInfo = data.duel;
        
        // Create incoming invite from real duel data
        const realInvite = {
          id: duelId,
          fromUserId: duelInfo.player1_id,
          fromUserName: duelInfo.fromUser?.firstName || 'Игрок',
          fromUserLevel: duelInfo.fromUser?.level || 1,
          message: `Приглашение на дуэль от ${duelInfo.fromUser?.firstName || 'игрока'}!`,
          receivedAt: Date.now(),
          expiresAt: new Date(duelInfo.expires_at).getTime()
        };
        
        handleIncomingInvite(realInvite);
      } else {
        console.error('❌ Failed to fetch duel info:', data.error);
        // Fallback to mock data if backend call fails
        const fallbackInvite = {
          id: duelId,
          fromUserId: 12345,
          fromUserName: 'Игрок',
          fromUserLevel: 1,
          message: 'Приглашение на дуэль!',
          receivedAt: Date.now(),
          expiresAt: Date.now() + (5 * 60 * 1000)
        };
        handleIncomingInvite(fallbackInvite);
      }
    } catch (error) {
      console.error('❌ Error fetching duel info:', error);
      // Fallback to mock data if request fails
      const fallbackInvite = {
        id: duelId,
        fromUserId: 12345,
        fromUserName: 'Игрок',
        fromUserLevel: 1,
        message: 'Приглашение на дуэль!',
        receivedAt: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000)
      };
      handleIncomingInvite(fallbackInvite);
    }
  };

  const handleIncomingInvite = (invite: any) => {
    const newInvite: IncomingDuelInvite = {
      id: invite.inviteId || invite.id,
      fromUserId: invite.fromUser?.id || invite.fromUserId,
      fromUserName: invite.fromUser?.name || invite.fromUserName,
      fromUserLevel: invite.fromUser?.level || invite.fromUserLevel,
      message: invite.message,
      receivedAt: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 минут на ответ
    };

    setIncomingInvites(prev => [...prev, newInvite]);
    
    // Показываем уведомление
    if (webApp?.showAlert) {
      webApp.showAlert(`🎮 Новое приглашение на дуэль от ${newInvite.fromUserName}!`);
    }
    
    // Вибрация
    hapticManager.heavy();
  };

  const respondToInvite = async (invite: IncomingDuelInvite, accept: boolean) => {
    setRespondingTo(invite.id);
    hapticManager.medium();

    try {
      if (accept) {
        // Принимаем приглашение
        if (webApp?.sendData) {
          const response = {
            type: 'duel_response',
            inviteId: invite.id,
            accepted: true,
            fromUserId: user?.id,
            fromUserName: user?.first_name,
            fromUserLevel: player.level
          };
          
          webApp.sendData(JSON.stringify(response));
        }

        // Показываем подтверждение
        if (webApp?.showAlert) {
          webApp.showAlert(`Дуэль принята! Подготовка к бою с ${invite.fromUserName}...`);
        }

        // Удаляем приглашение из списка
        setIncomingInvites(prev => prev.filter(inv => inv.id !== invite.id));
        
        // Запускаем режим дуэли
        setTimeout(() => {
          startMultiplayerMode('duel');
        }, 2000);

      } else {
        // Отклоняем приглашение
        if (webApp?.sendData) {
          const response = {
            type: 'duel_response',
            inviteId: invite.id,
            accepted: false,
            fromUserId: user?.id
          };
          
          webApp.sendData(JSON.stringify(response));
        }

        // Показываем уведомление
        if (webApp?.showAlert) {
          webApp.showAlert(`Приглашение от ${invite.fromUserName} отклонено.`);
        }

        // Удаляем приглашение из списка
        setIncomingInvites(prev => prev.filter(inv => inv.id !== invite.id));
      }

    } catch (error) {
      console.error('Ошибка ответа на приглашение:', error);
    } finally {
      setRespondingTo(null);
    }
  };

  // Автоматическое удаление истекших приглашений
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setIncomingInvites(prev => prev.filter(invite => invite.expiresAt > now));
    }, 30000); // Проверяем каждые 30 секунд

    return () => clearInterval(interval);
  }, []);

  if (incomingInvites.length === 0) {
    return null; // Не показываем компонент если нет приглашений
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-md w-full border border-orange-400/30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⚔️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Приглашение на дуэль!</h2>
          <div className="text-orange-400 text-sm">
            {incomingInvites.length} активных приглашений
          </div>
        </div>

        {incomingInvites.map((invite) => {
          const timeLeft = Math.max(0, invite.expiresAt - Date.now());
          const minutesLeft = Math.floor(timeLeft / 60000);
          const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

          return (
            <motion.div
              key={invite.id}
              className="bg-black/40 rounded-xl p-4 mb-4 border border-white/10"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-bold text-lg">
                    {invite.fromUserName}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Уровень {invite.fromUserLevel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-orange-400 text-sm font-medium">
                    ⏰ {minutesLeft}:{secondsLeft.toString().padStart(2, '0')}
                  </div>
                  <div className="text-gray-500 text-xs">до истечения</div>
                </div>
              </div>

              <div className="text-gray-300 text-sm mb-4 bg-black/20 rounded-lg p-3">
                🎮 Дуэль на 60 секунд<br/>
                🏆 Побеждает тот, кто наберет больше очков<br/>
                ⚡ Удачи и осторожности!
              </div>

              <div className="flex space-x-3">
                <motion.button
                  onClick={() => respondToInvite(invite, false)}
                  disabled={respondingTo === invite.id}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {respondingTo === invite.id ? '...' : '❌ Отклонить'}
                </motion.button>
                
                <motion.button
                  onClick={() => respondToInvite(invite, true)}
                  disabled={respondingTo === invite.id}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {respondingTo === invite.id ? '⏳ Принимаем...' : '✅ Принять'}
                </motion.button>
              </div>
            </motion.div>
          );
        })}

        <div className="text-center text-gray-400 text-xs mt-4">
          💡 Приглашения автоматически истекают через 5 минут
        </div>
      </motion.div>
    </div>
  );
};

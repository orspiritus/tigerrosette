import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useTelegram } from './TelegramProvider';
import { hapticManager } from '../utils/hapticManager';

interface TelegramContact {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  level?: number;
  totalGames?: number;
  wins?: number;
}

interface DuelInvite {
  id: string;
  fromUserId: number;
  toUserId: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: number;
  expiresAt: number;
}

export const DuelInviteScreen: React.FC = () => {
  const { player, goToMenu } = useGameStore();
  const { webApp, user, isInTelegram } = useTelegram();
  const [contacts, setContacts] = useState<TelegramContact[]>([]);
  const [pendingInvites, setPendingInvites] = useState<DuelInvite[]>([]);
  const [selectedContact, setSelectedContact] = useState<TelegramContact | null>(null);
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'waiting'>('idle');
  const [isLoading, setIsLoading] = useState(false);

  // Получение реальных игроков из базы данных бота
  useEffect(() => {
    if (isInTelegram && webApp && user) {
      loadRealPlayers(user.id);
    } else {
      setContacts([]);
    }
  }, [isInTelegram, webApp, user]);

  const loadRealPlayers = async (userId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/duels/players/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setContacts(data.players);
        console.log(`✅ Загружено ${data.players.length} реальных игроков`);
      } else {
        console.error('Ошибка загрузки игроков:', data.error);
        setContacts([]);
      }
    } catch (error) {
      console.error('Ошибка запроса игроков:', error);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendDuelInvite = async (contact: TelegramContact) => {
    if (!isInTelegram || !webApp || !user) {
      alert('Дуэли доступны только в Telegram!');
      return;
    }

    setInviteStatus('sending');
    hapticManager.medium();

    try {
      const response = await fetch('http://localhost:3001/api/duels/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromUserId: user.id,
          toUserId: contact.id,
          message: `${user.first_name} (Уровень ${player.level}) вызывает вас на дуэль!`
        })
      });

      const result = await response.json();

      if (result.success) {
        const invite: DuelInvite = {
          id: result.duelId,
          fromUserId: user.id,
          toUserId: contact.id,
          status: 'pending',
          createdAt: Date.now(),
          expiresAt: Date.now() + (5 * 60 * 1000)
        };

        setPendingInvites(prev => [...prev, invite]);
        setInviteStatus('sent');

        if (webApp.showAlert) {
          webApp.showAlert(`Приглашение отправлено ${contact.firstName}! Ожидаем ответа...`);
        }

        setTimeout(() => {
          setInviteStatus('waiting');
        }, 2000);
      } else {
        throw new Error(result.error || 'Ошибка отправки приглашения');
      }
    } catch (error) {
      console.error('Ошибка отправки приглашения:', error);
      setInviteStatus('idle');
      
      if (webApp?.showAlert) {
        webApp.showAlert('Ошибка отправки приглашения. Попробуйте еще раз.');
      }
    }
  };

  const handleContactSelect = (contact: TelegramContact) => {
    setSelectedContact(contact);
    hapticManager.light();
  };

  const handleSendInvite = () => {
    if (selectedContact) {
      sendDuelInvite(selectedContact);
    }
  };

  const handleBackToMenu = () => {
    hapticManager.light();
    goToMenu();
  };

  const getContactDisplayName = (contact: TelegramContact) => {
    const fullName = contact.lastName 
      ? `${contact.firstName} ${contact.lastName}`
      : contact.firstName;
    
    return contact.username ? `${fullName} (@${contact.username})` : fullName;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-dark to-background-darker">
      {/* Header */}
      <div className="bg-black/40 border-b border-white/10 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={handleBackToMenu}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Назад
          </button>
          <h1 className="text-white text-xl font-bold">⚔️ Приглашения на дуэль</h1>
          <div></div>
        </div>

        {/* Предупреждение для не-Telegram пользователей */}
        {!isInTelegram && (
          <div className="text-sm text-yellow-400 mt-2 text-center">
            ⚠️ Для дуэлей откройте игру в Telegram
          </div>
        )}
      </div>

      {/* Основной контент */}
      <div className="p-4">
        {isInTelegram ? (
          <>
            <div className="text-white text-lg mb-4 font-bold">
              👥 Игроки онлайн:
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-orange-400 text-4xl mb-4">⚡</div>
                <div className="text-gray-400">Загружаем игроков...</div>
              </div>
            ) : contacts.length > 0 ? (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    className={`glass-effect p-4 rounded-xl cursor-pointer transition-all ${
                      selectedContact?.id === contact.id 
                        ? 'border-2 border-green-400 bg-green-400/10' 
                        : 'border border-white/20 hover:border-orange-400'
                    }`}
                    onClick={() => handleContactSelect(contact)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {contact.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {getContactDisplayName(contact)}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Уровень {contact.level || 1} • Побед: {contact.wins || 0}/{contact.totalGames || 0}
                          </div>
                        </div>
                      </div>
                      
                      {selectedContact?.id === contact.id && (
                        <div className="text-green-400 text-2xl">✓</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-4">😔</div>
                <div className="text-lg mb-2">Нет доступных игроков</div>
                <div className="text-sm">
                  Пригласите друзей подписаться на бота для дуэлей!
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <div className="text-xl text-white mb-4">Откройте игру в Telegram</div>
            <div className="text-gray-400 mb-6">
              Дуэли доступны только подписчикам бота в Telegram
            </div>
            <a 
              href="https://orspiritus.github.io/tigerrosette/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              🚀 Открыть в Telegram
            </a>
          </div>
        )}
      </div>

      {/* Кнопка отправки приглашения */}
      {selectedContact && inviteStatus === 'idle' && (
        <div className="fixed bottom-6 left-4 right-4">
          <motion.button
            onClick={handleSendInvite}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ⚔️ Отправить вызов на дуэль {selectedContact.firstName}
          </motion.button>
        </div>
      )}

      {/* Статус ожидания */}
      {inviteStatus === 'waiting' && (
        <div className="fixed bottom-6 left-4 right-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-white text-lg mb-2">⏳ Ожидаем ответа...</div>
            <div className="text-gray-400 text-sm">
              Приглашение действительно 5 минут
            </div>
            <div className="mt-3">
              <div className="animate-pulse text-orange-400">⚡⚔️⚡</div>
            </div>
          </div>
        </div>
      )}

      {/* Активные приглашения */}
      {pendingInvites.length > 0 && (
        <div className="p-4 mt-4">
          <div className="text-white text-lg mb-3 font-bold">
            📋 Активные приглашения:
          </div>
          {pendingInvites.map((invite) => {
            const contact = contacts.find(c => c.id === invite.toUserId);
            const timeLeft = Math.max(0, invite.expiresAt - Date.now());
            const minutesLeft = Math.floor(timeLeft / 60000);
            
            return (
              <div key={invite.id} className="glass-effect p-3 rounded-lg mb-2">
                <div className="text-white">
                  {contact ? getContactDisplayName(contact) : 'Неизвестный пользователь'}
                </div>
                <div className="text-sm text-gray-400">
                  Статус: {invite.status} • Осталось: {minutesLeft}м
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

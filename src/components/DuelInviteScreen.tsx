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
  const { player, endGame } = useGameStore();
  const { webApp, user, isInTelegram } = useTelegram();
  const [contacts, setContacts] = useState<TelegramContact[]>([]);
  const [pendingInvites, setPendingInvites] = useState<DuelInvite[]>([]);
  const [selectedContact, setSelectedContact] = useState<TelegramContact | null>(null);
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'waiting'>('idle');

  // Получение контактов из Telegram
  useEffect(() => {
    if (isInTelegram && webApp) {
      // Используем Telegram API для получения контактов
      loadTelegramContacts();
    } else {
      // Для тестирования без Telegram - моковые контакты
      setContacts([
        { id: 12345, firstName: 'Анна', lastName: 'Иванова', username: 'anna_i' },
        { id: 54321, firstName: 'Михаил', lastName: 'Петров', username: 'mike_p' },
        { id: 98765, firstName: 'Елена', username: 'lena_gamer' },
        { id: 11111, firstName: 'Дмитрий', lastName: 'Козлов' },
      ]);
    }
  }, [isInTelegram, webApp]);

  const loadTelegramContacts = async () => {
    try {
      // Пока используем статичный список друзей
      // В реальной версии здесь будет интеграция с Telegram API
      setContacts([
        { id: 12345, firstName: 'Анна', lastName: 'Иванова', username: 'anna_i' },
        { id: 54321, firstName: 'Михаил', lastName: 'Петров', username: 'mike_p' },
        { id: 98765, firstName: 'Елена', username: 'lena_gamer' },
        { id: 11111, firstName: 'Дмитрий', lastName: 'Козлов' },
        { id: 22222, firstName: 'Ольга', lastName: 'Смирнова', username: 'olga_s' },
      ]);
      console.log('Контакты загружены (тестовый режим)');
    } catch (error) {
      console.error('Ошибка при загрузке контактов:', error);
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
      // Создаем уникальный ID приглашения
      const inviteId = `duel_${Date.now()}_${user.id}_${contact.id}`;
      
      // Формируем сообщение-приглашение
      const inviteMessage = `🎮⚔️ ДУЭЛЬ TIGERROZETKA!\n\n` +
        `${user.first_name} (Уровень ${player.level}) вызывает вас на дуэль!\n\n` +
        `⚡ Игра на 60 секунд\n` +
        `🏆 Кто наберет больше очков - тот победил!\n\n` +
        `Принять вызов? Нажмите кнопку ниже 👇`;

      // Отправляем приглашение через Telegram
      if (webApp.sendData) {
        const inviteData = {
          type: 'duel_invite',
          inviteId,
          fromUser: {
            id: user.id,
            name: user.first_name,
            level: player.level
          },
          toUserId: contact.id,
          message: inviteMessage
        };

        webApp.sendData(JSON.stringify(inviteData));
      }

      // Показываем приглашение пользователю
      if (webApp.showConfirm) {
        webApp.showConfirm(
          `Отправить приглашение на дуэль пользователю ${contact.firstName}?\n\n` +
          `Игра: 60 секунд\nВаш уровень: ${player.level}`,
          (confirmed: boolean) => {
            if (!confirmed) {
              setInviteStatus('idle');
              return;
            }
          }
        );
      }

      // Создаем локальное приглашение для отслеживания
      const invite: DuelInvite = {
        id: inviteId,
        fromUserId: user.id,
        toUserId: contact.id,
        status: 'pending',
        createdAt: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 минут на ответ
      };

      setPendingInvites(prev => [...prev, invite]);
      setInviteStatus('sent');

      // Показываем успешное уведомление
      if (webApp.showAlert) {
        webApp.showAlert(`Приглашение отправлено ${contact.firstName}! Ожидаем ответа...`);
      }

      // Переходим в режим ожидания
      setTimeout(() => {
        setInviteStatus('waiting');
      }, 2000);

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
    endGame();
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
          <h1 className="text-xl font-bold text-primary-orange">⚔️ ПРИГЛАСИТЬ НА ДУЭЛЬ</h1>
          <div className="text-sm text-gray-400">
            {isInTelegram ? '📱 Telegram' : '🌐 Web'}
          </div>
        </div>
      </div>

      {/* Статус */}
      <div className="bg-black/30 p-4 text-center">
        <div className="text-lg text-white mb-2">
          {inviteStatus === 'idle' && '👥 Выберите соперника для дуэли'}
          {inviteStatus === 'sending' && '📤 Отправка приглашения...'}
          {inviteStatus === 'sent' && '✅ Приглашение отправлено!'}
          {inviteStatus === 'waiting' && '⏳ Ожидаем ответа...'}
        </div>
        {!isInTelegram && (
          <div className="text-sm text-yellow-400">
            ⚠️ Для дуэлей откройте игру в Telegram
          </div>
        )}
      </div>

      {/* Контакты */}
      <div className="p-4">
        <div className="text-white text-lg mb-4 font-bold">
          📞 Ваши контакты:
        </div>
        
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
                      Нажмите, чтобы пригласить на дуэль
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

        {contacts.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">👥</div>
            <div>Загрузка контактов...</div>
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

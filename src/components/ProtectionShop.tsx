import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { ShopItem, PlayerProtection } from '../types/game';

interface ProtectionShopProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProtectionShop: React.FC<ProtectionShopProps> = ({ isOpen, onClose }) => {
  const { 
    player, 
    getShopItems, 
    buyProtectionItem,
    getTotalProtection 
  } = useGameStore();
  
  const [selectedCategory, setSelectedCategory] = useState<keyof PlayerProtection>('gloves');
  const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(null);

  // Закрытие по клавише Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const shopItems = getShopItems();
  const totalProtection = getTotalProtection();

  const categories = [
    { key: 'gloves' as keyof PlayerProtection, name: 'Перчатки', icon: '🧤' },
    { key: 'boots' as keyof PlayerProtection, name: 'Сапоги', icon: '👢' },
    { key: 'suit' as keyof PlayerProtection, name: 'Костюм', icon: '🥽' },
    { key: 'helmet' as keyof PlayerProtection, name: 'Каска', icon: '⛑️' }
  ];

  const filteredItems = shopItems.filter(item => item.type === selectedCategory);

  const handlePurchase = (item: ShopItem) => {
    const success = buyProtectionItem(item.type, item.level);
    if (success) {
      setPurchaseAnimation(item.id);
      setTimeout(() => setPurchaseAnimation(null), 1000);
    }
  };

  const canAfford = (price: number) => player.volts >= price;
  const isOwned = (item: ShopItem) => {
    const currentItem = player.protection[item.type];
    return currentItem.level >= item.level;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]"
      onClick={onClose}
      role="button"
      aria-label="Закрыть магазин"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">Магазин защиты</h2>
            <p className="text-gray-300">
              Вольты: <span className="text-yellow-400 font-bold">{player.volts}V</span> | 
              Общая защита: <span className="text-green-400 font-bold">{totalProtection.toFixed(1)}%</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Категории */}
        <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                selectedCategory === category.key
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Текущая экипировка */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-bold text-yellow-400 mb-2">
            Текущая экипировка: {categories.find(c => c.key === selectedCategory)?.name}
          </h3>
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div className="text-gray-400">Уровень:</div>
            <div className="text-white">{player.protection[selectedCategory].level || 'Нет'}</div>
            <div className="text-gray-400">Защита:</div>
            <div className="text-green-400">{player.protection[selectedCategory].protection}%</div>
            <div className="text-gray-400">Прочность:</div>
            <div className="text-blue-400">
              {player.protection[selectedCategory].durability}/{player.protection[selectedCategory].maxDurability}
            </div>
          </div>
        </div>

        {/* Товары */}
        <div className="grid gap-4">
          {filteredItems.map(item => {
            const owned = isOwned(item);
            const affordable = canAfford(item.price);
            const animating = purchaseAnimation === item.id;

            return (
              <motion.div
                key={item.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  owned 
                    ? 'border-green-500 bg-green-900 bg-opacity-30' 
                    : affordable 
                      ? 'border-yellow-400 bg-gray-800' 
                      : 'border-gray-600 bg-gray-800 opacity-60'
                }`}
                whileHover={!owned && affordable ? { scale: 1.02 } : {}}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="text-lg font-bold text-white">{item.name}</h4>
                        <p className="text-gray-300 text-sm">{item.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Уровень: </span>
                        <span className="text-yellow-400 font-bold">{item.level}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Защита: </span>
                        <span className="text-green-400 font-bold">{item.protection}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Прочность: </span>
                        <span className="text-blue-400 font-bold">{item.durability}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Цена: </span>
                        <span className="text-yellow-400 font-bold">{item.price}V</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <AnimatePresence>
                      {owned ? (
                        <div className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold">
                          Куплено
                        </div>
                      ) : (
                        <motion.button
                          onClick={() => handlePurchase(item)}
                          disabled={!affordable}
                          className={`px-4 py-2 rounded-lg font-bold transition-all ${
                            affordable
                              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                          whileTap={affordable ? { scale: 0.95 } : {}}
                          animate={animating ? {
                            scale: [1, 1.2, 1],
                            backgroundColor: ['#fbbf24', '#10b981', '#fbbf24']
                          } : {}}
                        >
                          {affordable ? 'Купить' : 'Нет вольт'}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Подсказка */}
        <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-400 rounded-lg">
          <p className="text-blue-300 text-sm">
            💡 <strong>Совет:</strong> Защитная экипировка изнашивается при ударах током. 
            Более качественная экипировка служит дольше и обеспечивает лучшую защиту.
          </p>
        </div>

        {/* Нижняя панель с кнопкой закрытия */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md font-bold bg-gray-700 text-white hover:bg-gray-600 border border-gray-500"
          >
            Закрыть
          </button>
        </div>
      </motion.div>
    </div>
  );
};

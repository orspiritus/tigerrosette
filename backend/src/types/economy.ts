export interface UserEconomy {
  volts: number;
  premiumVolts: number;
  energy: number;
}

export interface ShopItem {
  id: string;
  type: 'skin' | 'theme' | 'powerup' | 'boost' | 'energy' | 'premium_volts';
  name: string;
  description: string;
  price: ItemPrice;
  availability: ShopAvailability;
  previewImage?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ItemPrice {
  volts?: number;
  premiumVolts?: number;
  realMoney?: {
    amount: number;
    currency: 'USD' | 'EUR' | 'RUB';
  };
}

export interface ShopAvailability {
  isLimited: boolean;
  endDate?: Date;
  requiredLevel?: number;
  requiredAchievement?: string;
}

export interface PowerUpEffect {
  scoreMultiplier?: number;
  shockProtection?: number;
  energyReduction?: number;
  experienceBonus?: number;
}

export interface PurchaseRequest {
  itemId: string;
  paymentMethod: 'volts' | 'premium_volts' | 'telegram_stars' | 'ton';
  quantity?: number;
}

export interface AdReward {
  type: 'volts' | 'energy' | 'powerup' | 'lives' | 'premium_volts';
  amount: number;
  multiplier?: number;
}

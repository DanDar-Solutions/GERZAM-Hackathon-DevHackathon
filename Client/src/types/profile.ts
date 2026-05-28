export type ProfileType = 'wheelchair' | 'elderly' | 'visual';

export interface ProfileConfig {
  type: ProfileType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bannerGradient: string;
}

export const PROFILES: Record<ProfileType, ProfileConfig> = {
  wheelchair: {
    type: 'wheelchair',
    label: 'Тэргэнцэртэй',
    description: 'Саадгүй маршрут харуулна',
    icon: 'accessible',
    color: '#5c8c48',
    bannerGradient: 'linear-gradient(135deg, #3a3028, #5c8c48)',
  },
  elderly: {
    type: 'elderly',
    label: 'Ахмад настан',
    description: 'Аюулгүй, алхахад хялбар зам санал болгоно',
    icon: 'elderly',
    color: '#9b8c79',
    bannerGradient: 'linear-gradient(135deg, #2c2416, #6b5d4f)',
  },
  visual: {
    type: 'visual',
    label: 'Харааны бэрхшээлтэй',
    description: 'Дуу болон чичиргээт анхааруулга ашиглана',
    icon: 'visibility',
    color: '#d4a017',
    bannerGradient: 'linear-gradient(135deg, #3a3028, #a8862e)',
  },
};

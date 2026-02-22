export const BADGE_DEFINITIONS = {
  first_workout: {
    id: 'project.profile.badge.first_workout',
    defaultMessage: 'Primer entrenamiento',
    descId: 'project.profile.badge.first_workout.desc',
    defaultDesc: 'Completa tu primer entrenamiento registrado.',
    icon: 'fa-flag-checkered',
  },
  consistency_streak_3: {
    id: 'project.profile.badge.consistency_streak_3',
    defaultMessage: 'Consistencia I · 3 días seguidos',
    descId: 'project.profile.badge.consistency_streak_3.desc',
    defaultDesc: 'Entrena 3 días seguidos para crear hábito.',
    icon: 'fa-calendar-check',
  },
  consistency_streak_7: {
    id: 'project.profile.badge.consistency_streak_7',
    defaultMessage: 'Consistencia II · 7 días seguidos',
    descId: 'project.profile.badge.consistency_streak_7.desc',
    defaultDesc: 'Una semana completa de constancia.',
    icon: 'fa-calendar-week',
  },
  consistency_streak_14: {
    id: 'project.profile.badge.consistency_streak_14',
    defaultMessage: 'Consistencia III · 14 días seguidos',
    descId: 'project.profile.badge.consistency_streak_14.desc',
    defaultDesc: 'Dos semanas consecutivas entrenando.',
    icon: 'fa-fire',
  },
  strength_weight_40: {
    id: 'project.profile.badge.strength_weight_40',
    defaultMessage: 'Fuerza I · 40 kg+',
    descId: 'project.profile.badge.strength_weight_40.desc',
    defaultDesc: 'Levanta 40 kg o más en una serie.',
    icon: 'fa-dumbbell',
  },
  strength_weight_80: {
    id: 'project.profile.badge.strength_weight_80',
    defaultMessage: 'Fuerza II · 80 kg+',
    descId: 'project.profile.badge.strength_weight_80.desc',
    defaultDesc: 'Levanta 80 kg o más en una serie.',
    icon: 'fa-dumbbell',
  },
  strength_weight_120: {
    id: 'project.profile.badge.strength_weight_120',
    defaultMessage: 'Fuerza III · 120 kg+',
    descId: 'project.profile.badge.strength_weight_120.desc',
    defaultDesc: 'Levanta 120 kg o más en una serie.',
    icon: 'fa-dumbbell',
  },
  followers_bronze: {
    id: 'project.profile.badge.followers_bronze',
    defaultMessage: 'Social I · 1 seguidor',
    descId: 'project.profile.badge.followers_bronze.desc',
    defaultDesc: 'Logra tu primer seguidor.',
    icon: 'fa-users',
  },
  followers_silver: {
    id: 'project.profile.badge.followers_silver',
    defaultMessage: 'Social II · 5 seguidores',
    descId: 'project.profile.badge.followers_silver.desc',
    defaultDesc: 'Consigue al menos 5 seguidores.',
    icon: 'fa-users',
  },
  followers_gold: {
    id: 'project.profile.badge.followers_gold',
    defaultMessage: 'Social III · 10 seguidores',
    descId: 'project.profile.badge.followers_gold.desc',
    defaultDesc: 'Alcanza 10 seguidores o más.',
    icon: 'fa-users',
  },
  following_bronze: {
    id: 'project.profile.badge.following_bronze',
    defaultMessage: 'Explorador I · 1 seguido',
    descId: 'project.profile.badge.following_bronze.desc',
    defaultDesc: 'Sigue a tu primer usuario.',
    icon: 'fa-compass',
  },
  following_silver: {
    id: 'project.profile.badge.following_silver',
    defaultMessage: 'Explorador II · 5 seguidos',
    descId: 'project.profile.badge.following_silver.desc',
    defaultDesc: 'Sigue a al menos 5 usuarios.',
    icon: 'fa-compass',
  },
  following_gold: {
    id: 'project.profile.badge.following_gold',
    defaultMessage: 'Explorador III · 10 seguidos',
    descId: 'project.profile.badge.following_gold.desc',
    defaultDesc: 'Sigue a 10 usuarios o más.',
    icon: 'fa-compass',
  },
  comments_bronze: {
    id: 'project.profile.badge.comments_bronze',
    defaultMessage: 'Comentarista I · 1 comentario',
    descId: 'project.profile.badge.comments_bronze.desc',
    defaultDesc: 'Publica tu primer comentario.',
    icon: 'fa-comment-dots',
  },
  comments_silver: {
    id: 'project.profile.badge.comments_silver',
    defaultMessage: 'Comentarista II · 5 comentarios',
    descId: 'project.profile.badge.comments_silver.desc',
    defaultDesc: 'Participa con al menos 5 comentarios.',
    icon: 'fa-comment-dots',
  },
  comments_gold: {
    id: 'project.profile.badge.comments_gold',
    defaultMessage: 'Comentarista III · 10 comentarios',
    descId: 'project.profile.badge.comments_gold.desc',
    defaultDesc: 'Comparte 10 comentarios o más.',
    icon: 'fa-comment-dots',
  },
  likes_bronze: {
    id: 'project.profile.badge.likes_bronze',
    defaultMessage: 'Popular I · 1 like',
    descId: 'project.profile.badge.likes_bronze.desc',
    defaultDesc: 'Recibe tu primer like en alguna de tus rutinas.',
    icon: 'fa-heart',
  },
  likes_silver: {
    id: 'project.profile.badge.likes_silver',
    defaultMessage: 'Popular II · 5 likes',
    descId: 'project.profile.badge.likes_silver.desc',
    defaultDesc: 'Recibe al menos 5 likes en total.',
    icon: 'fa-heart',
  },
  likes_gold: {
    id: 'project.profile.badge.likes_gold',
    defaultMessage: 'Popular III · 10 likes',
    descId: 'project.profile.badge.likes_gold.desc',
    defaultDesc: 'Recibe 10 likes o más en total.',
    icon: 'fa-heart',
  },
};

export const BADGE_ORDER = Object.keys(BADGE_DEFINITIONS);

export const sortBadges = (codes = []) => {
  return [...codes].sort((a, b) => {
    const ia = BADGE_ORDER.indexOf(a);
    const ib = BADGE_ORDER.indexOf(b);
    return (ia === -1 ? BADGE_ORDER.length : ia) - (ib === -1 ? BADGE_ORDER.length : ib);
  });
};

const VARIANT_BY_CODE = {
  first_workout: 'profile-badge--first',
  consistency_streak_3: 'profile-badge--consistency-1',
  consistency_streak_7: 'profile-badge--consistency-2',
  consistency_streak_14: 'profile-badge--consistency-3',
  strength_weight_40: 'profile-badge--strength-1',
  strength_weight_80: 'profile-badge--strength-2',
  strength_weight_120: 'profile-badge--strength-3',
  followers_bronze: 'profile-badge--bronze',
  followers_silver: 'profile-badge--silver',
  followers_gold: 'profile-badge--gold',
  following_bronze: 'profile-badge--bronze',
  following_silver: 'profile-badge--silver',
  following_gold: 'profile-badge--gold',
  comments_bronze: 'profile-badge--bronze',
  comments_silver: 'profile-badge--silver',
  comments_gold: 'profile-badge--gold',
  likes_bronze: 'profile-badge--bronze',
  likes_silver: 'profile-badge--silver',
  likes_gold: 'profile-badge--gold',
};

export const badgeClassFor = (code) => VARIANT_BY_CODE[code] || 'profile-badge--neutral';

const LEVEL_GROUPS = [
  ['consistency_streak_3', 'consistency_streak_7', 'consistency_streak_14'],
  ['strength_weight_40', 'strength_weight_80', 'strength_weight_120'],
  ['followers_bronze', 'followers_silver', 'followers_gold'],
  ['following_bronze', 'following_silver', 'following_gold'],
  ['comments_bronze', 'comments_silver', 'comments_gold'],
  ['likes_bronze', 'likes_silver', 'likes_gold'],
];

export const collapseBadgeLevels = (codes = []) => {
  const set = new Set(codes);
  const output = new Set();

  LEVEL_GROUPS.forEach((group) => {
    const highest = [...group].reverse().find((code) => set.has(code));
    if (highest) output.add(highest);
  });

  codes.forEach((code) => {
    const inGroup = LEVEL_GROUPS.some((group) => group.includes(code));
    if (!inGroup) output.add(code);
  });

  return sortBadges([...output]);
};

export const allBadgesCatalog = () => BADGE_ORDER;

/**
 * Mapeo de iconos de FontAwesome a Heroicons
 * Importamos todos los iconos de Heroicons que necesitamos
 */

import {
  PlusIcon,
  FunnelIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  BookmarkIcon,
  CheckIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  BellIcon,
  HomeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

/**
 * Mapeo de nombres de FontAwesome a componentes de Heroicons
 */
export const iconMap = {
  // Acciones básicas
  'fa-plus': PlusIcon,
  'fa-edit': PencilIcon,
  'fa-trash': TrashIcon,
  'fa-trash-alt': TrashIcon,
  'fa-times': XMarkIcon,
  'fa-check': CheckIcon,
  'fa-save': ArrowDownTrayIcon,
  
  // Navegación
  'fa-arrow-left': ArrowLeftIcon,
  'fa-arrow-right': ChevronRightIcon,
  'fa-chevron-left': ChevronLeftIcon,
  'fa-chevron-right': ChevronRightIcon,
  'fa-home': HomeIcon,
  
  // Funcionalidades
  'fa-filter': FunnelIcon,
  'fa-search': MagnifyingGlassIcon,
  'fa-play': PlayIcon,
  'fa-bookmark': BookmarkIcon,
  'fa-ellipsis-v': EllipsisVerticalIcon,
  'fa-sync': ArrowPathIcon,
  'fa-bell': BellIcon,
  
  // Usuario
  'fa-user': UserIcon,
  'fa-cog': Cog6ToothIcon,
  'fa-sign-out-alt': ArrowRightIcon,
  
  // Documentos y listas
  'fa-file': DocumentTextIcon,
  'fa-calendar': CalendarIcon,
  'fa-list': ClipboardDocumentListIcon,
  'fa-check-circle': CheckCircleIcon,
  'fa-check-double': CheckCircleIcon,
};

/**
 * Obtiene el componente de icono de Heroicons basado en el nombre de FontAwesome
 * @param {string} iconName - Nombre del icono en formato FontAwesome (ej: 'fa-plus')
 * @returns {Component|null} - Componente de Heroicons o null si no existe
 */
export const getHeroIcon = (iconName) => {
  return iconMap[iconName] || null;
};

export default iconMap;


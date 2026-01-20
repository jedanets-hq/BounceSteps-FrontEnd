import React from 'react';
import { 
  User, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Settings, 
  Heart, 
  DollarSign, 
  Phone, 
  Plus, 
  ExternalLink,
  Home,
  Plane,
  Camera,
  FileText,
  Shield,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Unlock,
  Globe,
  Navigation,
  Compass,
  Map,
  Car,
  Bus,
  Train,
  Bed,
  Utensils,
  Coffee,
  ShoppingBag,
  Gift,
  Music,
  Mountain,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  Thermometer,
  Wind,
  Droplets,
  Zap,
  Wifi,
  Battery,
  Signal,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Share,
  Bookmark,
  Flag,
  Tag,
  Link,
  Copy,
  Save,
  Folder,
  File,
  Image,
  Video,
  Headphones,
  Mic,
  Bell,
  MessageCircle,
  Send,
  Inbox,
  Archive,
  Trash,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move,
  Layers,
  Grid,
  List,
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  Trophy,
  Coins,
  Wallet,
  Calculator,
  Percent,
  Hash,
  AtSign,
  Slash,
  Minus,
  Equal
} from 'lucide-react';

const iconMap = {
  // User & Profile
  User,
  Calendar,
  MapPin,
  CreditCard,
  Settings,
  Heart,
  DollarSign,
  Phone,
  Plus,
  ExternalLink,
  
  // Navigation
  Home,
  Plane,
  Camera,
  FileText,
  Shield,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  
  // Actions
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Unlock,
  
  // Location & Travel
  Globe,
  Navigation,
  Compass,
  Map,
  Car,
  Bus,
  Train,
  
  // Services
  Bed,
  Utensils,
  Coffee,
  ShoppingBag,
  Gift,
  Music,
  Mountain,
  
  // Weather
  Sun,
  Moon,
  Cloud,
  Umbrella,
  Thermometer,
  Wind,
  Droplets,
  
  // Tech
  Zap,
  Wifi,
  Battery,
  Signal,
  Volume2,
  VolumeX,
  
  // Media
  Play,
  Pause,
  
  // Social
  Share,
  Bookmark,
  Flag,
  Tag,
  Link,
  Copy,
  
  // Files
  Save,
  Folder,
  File,
  Image,
  Video,
  
  // Communication
  Headphones,
  Mic,
  Bell,
  MessageCircle,
  Send,
  Inbox,
  Archive,
  Trash,
  
  // Actions
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move,
  
  // Layout
  Layers,
  Grid,
  List,
  
  // Charts
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  
  // Achievement
  Target,
  Award,
  Trophy,
  
  // Money
  Coins,
  Wallet,
  Calculator,
  Percent,
  
  // Symbols
  Hash,
  AtSign,
  Slash,
  Minus,
  Equal
};

export const Icon = ({ name, size = 24, className = "", ...props }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    // Icon not found - return a default placeholder
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M9,9h6v6H9z"/>
      </svg>
    );
  }
  
  return (
    <IconComponent 
      size={size} 
      className={className} 
      {...props} 
    />
  );
};

export default Icon;

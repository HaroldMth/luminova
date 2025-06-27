export const INTERNAL_TOKEN = "789865452211zàjejebeh";

export const ANIME_AVATARS = [
  "https://images.pexels.com/photos/7130555/pexels-photo-7130555.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.pexels.com/photos/7130545/pexels-photo-7130545.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.pexels.com/photos/7130547/pexels-photo-7130547.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.pexels.com/photos/7130549/pexels-photo-7130549.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.pexels.com/photos/7130551/pexels-photo-7130551.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.pexels.com/photos/7130553/pexels-photo-7130553.jpeg?auto=compress&cs=tinysrgb&w=200"
];

export const LUMIVORA_CHANNEL = "https://whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O";

export const SUSPICIOUS_USER_AGENTS = [
  "bot", "crawler", "spider", "scraper", "curl", "wget", "python", "requests", "axios", "fetch"
];

export const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // Strict limit per IP
  ddosWindowMs: 60 * 1000, // 1 minute for DDoS detection
  ddosMaxRequests: 50 // Max requests per minute before blocking
};

export const ADMIN_SECRET_PATH = "hans-tech-admin-2025";
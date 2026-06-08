export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface Gift {
  id: string;
  name: string;
  image: string;
  description: string;
  stock: number;
  created_at: string;
}

export interface Participant {
  id: string;
  user_id: string;
  gift_id: string;
  created_at: string;
  users?: User;
  gifts?: Gift;
}

export interface DashboardStats {
  totalUsers: number;
  totalGifts: number;
  totalParticipants: number;
}

export interface Volunteer {
  id: string;
  name: string;
  register_id: string;
  has_car: boolean;
  can_transport: boolean;
  is_online: boolean;
  lat: number | null;
  lng: number | null;
  last_seen: string;
  created_at: string;
}

export interface HelpRequest {
  id: string;
  requester_lat: number;
  requester_lng: number;
  volunteer_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
}

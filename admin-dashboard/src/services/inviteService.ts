import api from './api';

export interface Invite {
  email: string;
  role?: string;
}

export const inviteService = {
  // Send an invite to a user
  async sendInvite(inviteData: Invite): Promise<void> {
    await api.post('/invite', inviteData);
  },
};

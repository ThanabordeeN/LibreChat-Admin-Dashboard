import api from './api';

export interface Invite {
  email: string;
  role?: string;
}

export const inviteService = {
  async sendInvite(inviteData: Invite): Promise<{ inviteLink: string }> {
    const res = await api.post('/admin/invite', inviteData);
    return { inviteLink: res.data.inviteLink };
  },
};

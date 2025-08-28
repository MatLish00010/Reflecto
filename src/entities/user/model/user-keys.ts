export const userKeys = {
  all: ['user'] as const,
  subscription: (userId: string) => ['user', userId, 'subscription'] as const,
};

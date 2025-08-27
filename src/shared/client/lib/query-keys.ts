/**
 * Utility functions for creating standardized React Query keys
 * Provides common patterns for entity-based query keys
 */

import type { QueryKey } from '@/shared/common/types';

/**
 * Base entity keys factory
 * Creates standard key patterns for any entity
 */
export const createEntityKeys = <TUserId extends string = string>(
  entityName: string
) => ({
  /**
   * Base key for all entity operations
   */
  all: (userId: TUserId): QueryKey => [entityName, userId] as const,

  /**
   * Key for list operations
   */
  lists: (userId: TUserId): QueryKey =>
    [...createEntityKeys(entityName).all(userId), 'list'] as const,

  /**
   * Key for specific list with filters
   */
  list: (userId: TUserId, filters?: Record<string, unknown>): QueryKey =>
    filters
      ? ([...createEntityKeys(entityName).lists(userId), filters] as const)
      : createEntityKeys(entityName).lists(userId),

  /**
   * Key for detail operations
   */
  details: (userId: TUserId): QueryKey =>
    [...createEntityKeys(entityName).all(userId), 'detail'] as const,

  /**
   * Key for specific detail by ID
   */
  detail: (userId: TUserId, id: string | number): QueryKey =>
    [...createEntityKeys(entityName).details(userId), id] as const,

  /**
   * Key for summaries operations
   */
  summaries: (userId: TUserId): QueryKey =>
    [...createEntityKeys(entityName).all(userId), 'summaries'] as const,

  /**
   * Key for specific summaries with filters
   */
  summariesList: (
    userId: TUserId,
    filters?: Record<string, unknown>
  ): QueryKey =>
    filters
      ? ([...createEntityKeys(entityName).summaries(userId), filters] as const)
      : createEntityKeys(entityName).summaries(userId),
});

/**
 * Date-based entity keys factory
 * Extends base entity keys with date-specific patterns
 */
export const createDateBasedEntityKeys = <TUserId extends string = string>(
  entityName: string
) => {
  const baseKeys = createEntityKeys<TUserId>(entityName);

  return {
    ...baseKeys,

    /**
     * Key for list with date range
     */
    list: (userId: TUserId, from?: string, to?: string): QueryKey => {
      const filters = from || to ? { from, to } : undefined;
      return baseKeys.list(userId, filters);
    },

    /**
     * Key for detail with date range
     */
    detail: (userId: TUserId, from: string, to: string): QueryKey =>
      baseKeys.detail(userId, `${from}-${to}`),

    /**
     * Key for summaries with date range
     */
    summariesList: (userId: TUserId, from?: string, to?: string): QueryKey => {
      const filters = from || to ? { from, to } : undefined;
      return baseKeys.summariesList(userId, filters);
    },

    /**
     * Key for today's summary
     */
    today: (userId: TUserId): QueryKey => baseKeys.detail(userId, 'today'),
  };
};

/**
 * Simple entity keys factory
 * For entities that don't need complex filtering
 */
export const createSimpleEntityKeys = <TUserId extends string = string>(
  entityName: string
) => ({
  all: (userId: TUserId): QueryKey => [entityName, userId] as const,
  lists: (userId: TUserId): QueryKey =>
    [...createSimpleEntityKeys(entityName).all(userId), 'list'] as const,
  list: (userId: TUserId): QueryKey =>
    createSimpleEntityKeys(entityName).lists(userId),
});

/**
 * Global entity keys factory
 * For entities that don't require user context
 */
export const createGlobalEntityKeys = (entityName: string) => ({
  all: (): QueryKey => [entityName] as const,
});

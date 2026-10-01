/** HTTP paths for media (gateway public + media-service internal). */
export const MEDIA_HTTP_PATHS = {
  root: 'media',
  byId: 'media/:id',
  content: 'media/:id/content',
  lookup: 'media/lookup',
} as const;

/** Header gateway → media-service: authenticated uploader id. */
export const MEDIA_OWNER_HEADER = 'x-roomly-owner-id';

export type MediaStatus = 'ready' | 'processing' | 'failed';

/** Domain / other services store only this id. */
export type MediaUploadResponse = {
  id: string;
};

/** Full media card for UI — assembled on gateway. */
export type MediaResponse = {
  id: string;
  /** Gateway-relative content URL, e.g. `/media/{id}/content` */
  url: string;
  contentType: string;
  size: number;
  originalName: string | null;
  status: MediaStatus;
  createdAt: string;
};

/** Internal record from media-service (no public URL). */
export type MediaRecord = {
  id: string;
  contentType: string;
  size: number;
  originalName: string | null;
  status: MediaStatus;
  createdAt: string;
};

export type MediaLookupRequest = {
  ids: string[];
};

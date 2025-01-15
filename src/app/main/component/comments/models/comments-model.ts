export interface CommentsModel {
  currentPage: number;
  page: Array<CommentsDTO>;
  totalElements: number;
}

export interface AuthorDTO {
  id: number;
  name: string;
  profilePicturePath: null;
}

export interface CommentsDTO {
  author: AuthorDTO;
  currentUserLiked: boolean;
  id: number;
  likes: number;
  modifiedDate: string;
  replies: number;
  status: string;
  text: string;
  isEdit?: boolean;
  showRelyButton?: boolean;
  showAllRelies?: boolean;
  numberOfLikes?: number;
  additionalImages?: string[];
}

export interface AddedCommentDTO {
  author: AuthorDTO;
  id: number;
  modifiedDate: string;
  text: string;
}

export interface CommentFormData {
  entityId: number;
  text: string;
  imageFiles: File[];
  parentCommentId?: number;
}

export interface SocketAmountLikes {
  id: number;
  amountLikes: number;
  liked: boolean;
  userId: number;
}
export interface TaggedUser {
  userId: number;
  userName: string;
  profilePicture: string;
}

export enum dataTypes {
  commentType = 'comment',
  wrapperCommentType = 'wrapper-comment',
  wrapperReplyType = 'wrapper-reply'
}

export interface PaginationConfig {
  id: string;
  itemsPerPage: number;
  currentPage: number;
  totalItems: number;
}

export interface EmojiEvent {
  emoji: { native: string };
}

import { CommentsDTO } from '../models/comments-model';

export const MOCK_COMMENTS_DTO: CommentsDTO = {
  author: {
    id: 0,
    name: 'fake_author',
    profilePicturePath: null
  },
  currentUserLiked: false,
  id: 0,
  likes: 0,
  modifiedDate: '',
  replies: 0,
  status: 'ORIGINAL',
  text: 'fake_text'
};

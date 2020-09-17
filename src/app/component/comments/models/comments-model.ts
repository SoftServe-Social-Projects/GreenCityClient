export interface CommentsModel {
    currentPage: number;
    page: Array<CommentsDTO>;
    totalElements: number;
}

export interface AuthorDTO {
    id: number;
    name: string;
    userProfilePicturePath: null;
}

export interface CommentsDTO {
    author: AuthorDTO;
    currentUserLiked: boolean;
    id: number;
    modifiedDate: string;
    replies: number;
    status: string;
    text: string;
    isEdit?: boolean;
    addReply?: boolean;
    allRelies?: boolean;
}

import { CALL_API } from "./api.actions";

export const POST_UPLOADED_FILE_REQUEST =
  "actions/upload/POST_UPLOADED_FILE_REQUEST";
export const POST_UPLOADED_FILE_FAILED =
  "actions/upload/POST_UPLOADED_FILE_FAILED";
export const POST_UPLOADED_FILE_SUCCESS =
  "actions/upload/POST_UPLOADED_FILE_SUCCESS";

export const postUploadedFile = (userId, file) => ({
  type: CALL_API,
  types: [
    POST_UPLOADED_FILE_REQUEST,
    POST_UPLOADED_FILE_SUCCESS,
    POST_UPLOADED_FILE_FAILED
  ],
  method: "post",
  endPoint: `api/v1/users/${userId}/documents`,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  body: file,
  showLoader: true,
  notificationOpts: {
    error: {
      variant: 'error'
    },
    success: {
      message: 'Document uploaded successfully',
    },
  },
});

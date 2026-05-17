type PaginationData = {
  page: number ;
  limit: number;
  totalItems: number;
};

export const jsonResponse = <T>(
  status: boolean,
  msg: string,
  data?: T,
  paginationData?: PaginationData,
) => {

  return {
    status,
    msg,
    data,
    page : paginationData?.page,
    limit : paginationData?.limit,
    totalItems : paginationData?.totalItems
  };
};

// export const jsonErrorResponse = (msg: string, error: string) => {
//   return {
//     status: false,
//     msg,
//     error,
//   };
// };


// type for pagination data in json response
type PaginationData = {
  page: number ;
  limit: number;
  totalItems: number;
};

/**
 * Return a standardized JSON response object with the given status, 
 * message, data, and pagination information.
 * @template T The type of the data being returned in the response.
 * @param status Boolean indicating the success status of the response.
 * @param msg 
 * @param data 
 * @param paginationData 
 * @returns Object containing the response status, message, data, and pagination info.
 */
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

export const jsonResponse = <T>(status: boolean, msg: string, data?: T) => {
  return {
    status,
    msg,
    data,
  };
};

// export const jsonErrorResponse = (msg: string, error: string) => {
//   return {
//     status: false,
//     msg,
//     error,
//   };
// };

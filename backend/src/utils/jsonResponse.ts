export const jsonResponse = (status: boolean, msg: string, data: any) => {
  return {
    status,
    msg,
    data,
  };
};

export const jsonErrorResponse = (msg: string, error: string) => {
  return {
    status: false,
    msg,
    error,
  };
};

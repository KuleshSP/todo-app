import {v4 as uuid} from 'uuid';

export const getSmallUUID = () => {
  const uniqueId = uuid();
  return uniqueId.slice(0, 8);
};

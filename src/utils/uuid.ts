import {uuid} from 'uuidv4';

export const getSmallUUID = () => {
  const uniqueId = uuid();
  return uniqueId.slice(0, 8);
};

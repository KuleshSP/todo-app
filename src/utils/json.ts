export const tryParseJSONObject = (jsonString: string) =>{
  try {
    const object = JSON.parse(jsonString);

    if (object && typeof object === 'object') {
      return object;
    }
  } catch (e) {
    throw e;
  }

  return false;
};

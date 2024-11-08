// Accepts only specific fields from objects; ignores others
exports.filterFieldsObj = (objInput, ...fields) => {
  const newObj = {};
  Object.keys(objInput).forEach((el) => {
    if (fields.includes(el)) newObj[el] = objInput[el];
  });
  return newObj;
};

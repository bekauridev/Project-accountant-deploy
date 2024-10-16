// Filtered out unwanted fields from Obj
const filterFieldsObj = (objInput, ...fields) => {
  const newObj = {};
  Object.keys(objInput).forEach((el) => {
    if (fields.includes(el)) newObj[el] = objInput[el];
  });
  return newObj;
};

module.exports = filterFieldsObj;

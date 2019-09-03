require("../src/db/mongoose");
const User = require("../src/models/user");

const updateAgeAndCount = async (id, age) => {
  const user = await User.findByIdAndUpdate(id, { age });
  const userCount = await User.countDocuments({ age });
  return userCount;
};

updateAgeAndCount("5d65537790b9e92522589623", 0)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.log(error);
  });
